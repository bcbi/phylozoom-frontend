
// Functions to interact with API

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


// Read data and set up input fields (radio buttons, dropdowns)

var paths = {};

d3.text("assets/static/hd_tree_taxon_path.txt", function(data) {
    data.split("\n").slice(0,-1).forEach( function(element) {
        var elementArray = element.split("$");
        paths[elementArray[0]] = elementArray[1].split(".").length;
    })
});

// Function to filter data for dropdown based on radio button selection.
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

// Function to populate dropdown
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

// Function to set up initial taxon dropdown.
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

// Function to get the possible levels for second dropdown.
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

// Function to set initial level dropdown.
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


// Set up variables and initiate tree.

var dropdown = d3.select("#dropdown-id");
var input = d3.select("#dropdown-id-levels");
var radio = d3.selectAll(".radio");
var treeView = d3.select("#tree-view");
var branchView = d3.select("#branch-view");


function edgeStyler(element, data) {
    var selected_id = d3.select("#dropdown-id").property("value");
    var selected_name = d3.select("#" + selected_id).text();

    if (data.target.name == selected_name) {
            element.style("stroke", "blue")
                   .style("stroke-width", "6px");
    }
    else {
        element.style("stroke", "gray")
               .style("stroke-width", "3px");
    }
}

function edgeStylerFull(element, data) {
    var selected_id = d3.select("#dropdown-id").property("value");

    if (data.target.name == selected_id) {
            element.style("stroke", "blue")
                   .style("strokw-width", "10px");
    }
    else {
        element.style("stroke", "lightgray");
    }
}

function initTree() {
    var height = window.innerHeight / 1.8,
        width = window.innerWidth / 3;

    d3.select(".tree-container")
        .append("svg")
        .attr("id", "tree-display");

    var main_tree = d3.layout.phylotree()
                 .svg(d3.select("#tree-display"))
                 .options({
                           'left-right-spacing': 'fit-to-size',
                           'top-bottom-spacing': 'fit-to-size',
                           'zoom': false,
                           'show-scale': true,
                           'align-tips': true,
                         })
                 .size([height, width])
                 .font_size(15)
                 .style_edges(edgeStyler);


    return main_tree;
}

function getData() {
    var selected_id = d3.select("#dropdown-id").property("value");
    var selected_level = d3.select("#dropdown-id-levels").property("value");
    return [selected_id, selected_level]
}

var main_tree = initTree();
var guide_tree, parsed;


function updateTree(main_tree) {
    var data = getData();
    search(data[0], data[1]).then(function(result) {
            var parsed_newick = d3.layout.newick_parser(result);
            main_tree(parsed_newick).layout();
            d3.selectAll(".internal-node").remove();
            d3.selectAll("text").style("font-size", "18px");

            main_tree.style_edges(edgeStyler);
    });
}


// Actions

dropdown.on("change", function() {
    if (!d3.select("#large-tree-display")[0][0]) {
        var selected_id = getData()[0];
        var dropdown_data = getLevelDropdown(selected_id);
        setLevelDropdown(dropdown_data);
        updateTree(main_tree);
    }
    else {

        d3.select("#tree-guide").style_edges(edgeStylerFull);
    }
});

input.on("change", function() {
    if (!d3.select("#large-tree-display")[0][0]) {
        var selected_id = getData()[0];
        updateTree(main_tree);
    }
});

radio.on("change", function(){
    d3.selectAll("#dropdown-id").selectAll("option").remove();
    setNameDropdown()
});


treeView.on("click", function() {
    d3.select("#large-tree-display")
        .remove();
    d3.select("#tree-display")
        .style("display", "none");
    d3.select("#guide")
        .remove();
    d3.select(".tree-container")
        .append("div").attr("class", "fa-5x")
        .append("span").attr("class", "fas fa-spinner fa-pulse")
    d3.select(".tree-container")
      .append("svg")
      .attr("id", "large-tree-display");
    d3.text("assets/static/hd_consensus_tree.nwk", function(data) {
        largeTree(data);
        d3.select(".fa-5x").remove();
    })
})

branchView.on("click", function() {
    d3.select("#large-tree-display").remove();
    d3.select("#tree-display").style("display", "initial");
    d3.select("#guide").remove();
    updateTree(main_tree);
})
