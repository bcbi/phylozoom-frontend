// Get possible levels
var paths = {};

d3.text("assets/static/hd_tree_taxon_path.txt", function(data) {
    data.split("\n").slice(0,-1).forEach( function(element) {
        var elementArray = element.split("$");
        paths[elementArray[0]] = elementArray[1].split(".").length;
    })
});

// Populate dropdown
function filter_menu(d) {
    if(d3.select(".pt").property("checked") && d.startsWith("pt")) {
        var id_ = d;
    } else if (d3.select(".dr").property("checked") && d.startsWith("dr")) {
        var id_ = d;
    } else if (d3.select(".all").property("checked")) {
        var id_ = d;
    }
    else { var id_ = false ;}
    return id_
};

function populateDropdown(dropdownId, data) {
  d3.select("#" + dropdownId)
    .selectAll("option")
    .data(_.sortBy(data, 'name'))
    .enter()
    .append("option")
    .attr("id", function(option) { return option.id; })
    .attr("value", function(option) { return option.id; })
    .text(function(option) { return option.name; });

};

function setNameDropdown() {
    var nameId = [{"id": "placeholder", "name": "1. Choose taxon"}];

    d3.text("assets/static/drugid_names.txt", function(data) {
      data.split("\n").forEach( function(element) {
        var item = {};
        var elementArray = element.split("$");
        var max_level = (paths[elementArray[0]] - 9) / 2;

        if ( max_level > 1 && filter_menu(elementArray[0])) {
            item.id = elementArray[0];
            item.name = elementArray[1];
            nameId.push(item);
            }
        });
        populateDropdown("dropdown-id", nameId);
    });
}

setNameDropdown();

function getLevelDropdown(selected_id) {
    max_level = (paths[selected_id] - 9) / 2;
    if (max_level > 0) {
        possibleLevels = _.range(0,max_level);
    }
    else {
        possibleLevels = [0,1];
    }
    return possibleLevels
};

var levelsArray = [
    {
     "name": "2. Choose level",
     "id": 0
    }
];

populateDropdown("dropdown-id-levels", levelsArray);

function setLevelDropdown(data) {
    var input =  d3.select("#dropdown-id-levels");

    input.selectAll("option").remove();
    populateDropdown("dropdown-id-levels", levelsArray);

    input
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .attr("value", function(data) { return String(data); })
      .text(function(data) { return data; });
};


var height = 900,
    width = 900


var main_tree = d3.layout.phylotree()
             .svg(d3.select("#tree_display"))
             .options({
                       'left-right-spacing': 'fit-to-size',
                       'top-bottom-spacing': 'fit-to-size',
                       'zoom': true,
                       'show-scale': true,
                       'align-tips': true,
                     })
             .size([height, width])
             .font_size(30);

function search(id, level) {
 return fetch(`http://127.0.0.1:8081/?id=${id}&level=${level}`, {
   accept: 'html/text',
 }).then(checkStatus)
   .then(parseText);
}

function checkStatus(response) {
 if (response.status >= 200 && response.status < 300) {
   return response;
 } else {
   const error = new Error(`HTTP Error ${response.statusText}`);
   error.status = response.statusText;
   error.response = response;
   console.log(error); // eslint-disable-line no-console
   throw error;
 }
}

function parseText(response) {
 return response.text();
}
var dropdown = d3.select("#dropdown-id");
var input = d3.select("#dropdown-id-levels");
var radio = d3.selectAll(".radio");

function getData() {
    var selected_id = d3.select("#dropdown-id").property("value");
    var selected_level = d3.select("#dropdown-id-levels").property("value");
    return [selected_id, selected_level]
}

function updateTree() {
    var data = getData();
    search(data[0], data[1]).then(function(result) {
            var parsed = d3.layout.newick_parser(result);
            main_tree(parsed).layout();
            d3.selectAll(".internal-node").remove();
    });
}


dropdown.on("change", function() {
    var selected_id = getData()[0];
    var dropdown_data = getLevelDropdown(selected_id);
    setLevelDropdown(dropdown_data);
    updateTree();
});

input.on("change", function() {
    var selected_id = getData()[0];
    updateTree();
});

radio.on("change", function(){
    d3.selectAll("#dropdown-id").selectAll("option").remove();
    setNameDropdown()
});
