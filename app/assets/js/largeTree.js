function largeTree(newick_str) {
    d3.select(".tree-container").append("div")
      .attr("id", "guide")
      .append("svg")
      .attr("id", "tree-guide");

    var guide_tree, parsed;
    var width = window.innerWidth / 2;
    var main_tree = d3.layout.phylotree()
                 .svg(d3.select("#large-tree-display"))
                 .options({
                           'left-right-spacing': 'fit-to-size',
                           'top-bottom-spacing': 'fit-to-size',
                           'zoom': false,
                           'show-scale': true,
                           'align-tips': true,
                         })
                 .size([38330, width]);


    // render to this SVG element
    parsed = d3.layout.newick_parser(newick_str);
    main_tree(parsed).font_size([200])
      // parse the Newick into a d3 hierarchy object with additional fields
      .layout();
    // layout and render the tree
    // Sort deepest clades towards bottom of tree
    var i = 0;
    main_tree.traverse_and_compute (function (n) {
      var d = 1;
      if(!n.name) {
        n.name = "Node"+i++;
      }
      if (n.children && n.children.length) {
        d += d3.max (n.children, function (d) { return d["count_depth"];});
      }
      n["count_depth"] = d;
    });
    main_tree.resort_children (function (a,b) {
      return (a["count_depth"] - b["count_depth"]);
    });
    var guide_height = window.innerHeight / 2,
      guide_width = 400;
    d3.select('#guide')
      .style('height', guide_height+'px')
      .style('width', guide_width+'px');
    guide_tree = d3.layout.phylotree()
      .svg(d3.select("#tree-guide"))
      .options({
        'left-right-spacing': 'fit-to-size',
        // fit to given size top-to-bottom
        'top-bottom-spacing': 'fit-to-size',
        // fit to given size left-to-right
        'collapsible': false,
        // turn off the menu on internal nodes
        'transitions': false,
        // turn off d3 animations
        'show-scale': false,
        // disable brush
        'brush': false,
        // disable selections on this tree
        'selectable': false
      })
      .size([guide_height, guide_width])
      .node_circle_size(0);
    guide_tree(parsed)
      .layout();

    var x = d3.scale.linear()
      .domain([0, document.body.scrollWidth])
      .range([0, guide_width]);
    var y = d3.scale.linear()
      .domain([0, document.body.scrollHeight])
      .range([0, guide_height]);
    var rect = d3.select("#tree-guide")
      .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .style('opacity', .6)
        .attr('width', x(window.innerWidth))
        .attr('height', y(window.innerHeight));
    document.body.onscroll = function(event) {
      rect.attr('x', x(window.scrollX))
        .attr('y', y(window.scrollY));
    };
    d3.select('#guide').on("click", function() {
      var coords = d3.mouse(this),
        new_x = x.invert(coords[0])-window.innerWidth/2,
        new_y = y.invert(coords[1])-window.innerHeight/2;
      window.scrollTo(new_x, new_y);
    });
    main_tree.selection_callback(function(selected){
      guide_tree.sync_edge_labels();
    });
};
