// custom variables
var w = 500, h = 190,
    num = 30, speed = 50,
    algo = "selection", // default algo
    dataset, scale, padding = 2, timer,
    states = {"default": 0, "finished": 1, "current": 2, "compare": 3, "minimal": 4, "hide": 5},
    colors = ["#B7C4CF", "#3565A1", "#D55511", "#74A82A", "#A42F11", "#fff"],
    color_default = "#6A6BCD", color_highlight = "#C24787",
    svg;

// init the graph
setDataset(num);
setRects(dataset);

// algo definition
var algos = {};

    // О(n2)
    // http://en.wikipedia.org/wiki/Selection_sort
algos.selection = function() {
    var i, j, len = dataset.length, iMin, inI = false;
    
    j = 0; i = len; inI = false;
    
    timer = setInterval(function() {
        
        if (j < len - 1) {
            dataset[j].state = states.current;
            
            if (!inI) {
                iMin = j;
                i = j + 1;
                inI = true;
            }
            
            if (i < len) {
                if (dataset[i - 1].state === states.compare) {
                    dataset[i - 1].state = states.default;
                }
                
                dataset[i].state = states.compare;
                
                if (dataset[i].num < dataset[iMin].num) {
                    if (iMin !== j)
                        dataset[iMin].state = states.default;
                    
                    iMin = i;
                    
                    dataset[iMin].state = states.minimal;
                }
                
                i++;
            } else {
                inI = false;
                
                if (iMin !== j) {
                    swap(iMin, j);
                }
                
                dataset[i - 1].state = states.default;
                dataset[iMin].state = states.default;
                dataset[j].state = states.finished;
                
                j++;
            }
        } else {
            dataset[j].state = states.finished;
            clearInterval(timer);
        }
        
        redrawRects(dataset);
        
    }, speed);
};

    // O(n2), Best: O(n)
    // http://en.wikipedia.org/wiki/Insertion_sort
algos.insertion = function() {
    var i, j, len = dataset.length, inI = false;
    
    j = 1; i = 0; inI = false;
    
    dataset[0].state = states.finished;
    
    timer = setInterval(function() {
        
        if (j < len) {
            if (!inI) {
                dataset[j].state = states.hide;
                
                i = j - 1;
                inI = true;
            }
            
            if (i >= 0) {
                if (dataset[i].num > dataset[i + 1].num) {
                    swap(i, i + 1);
                } else {
                    dataset[i + 1].state = states.finished;
                    
                    j++;
                    inI = false;
                }
                
                i--;
            } else {
                dataset[0].state = states.finished;
                
                j++;
                inI = false;
            }
            
        } else {
            clearInterval(timer);
        }
        
        redrawRects(dataset);
        
    }, speed);
};

    // O(n2)
    // http://en.wikipedia.org/wiki/Bubble_sort
algos.bubble = function() {
    var i, j, len = dataset.length, inI = false, wait;
    
    j = len - 1; i = 0; inI = false; wait = false;
    
    timer = setInterval(function() {
        
        if (j > 0) {
            if (!inI) {
                i = 0;
                inI = true;
            }
            
            if (i < j) {
                if (!wait) {
                    if (i != 0) {
                        dataset[i - 1].state = states.default;
                    }
                    
                    dataset[i].state = states.current;
                    dataset[i + 1].state = states.compare;
                } else {
                    if (dataset[i].num > dataset[i + 1].num) {
                        swap(i, i + 1);
                    }
                    
                    i++;
                }
                
                wait = !wait;
            } else {
                dataset[j - 1].state = states.default;
                dataset[j].state = states.finished;
                
                j--;
                inI = false;
            }
            
        } else {
            dataset[0].state = states.finished;
            
            clearInterval(timer);
        }
        
        redrawRects(dataset);
        
    }, speed);
};

//algos[algo]();

// common swap function
function swap(i, j) {
    var temp = dataset[i];
    dataset[i] = dataset[j];
    dataset[j] = temp;
}

// generate random dataset
function setDataset(len) {
    len = len || 20;
    
    var i = 0;
    
    dataset = [];
    
    for (; i < len; i++) {
        dataset[i] = { num: (Math.random() * len * 2) | 0, 
                       state: states.default };
    }
    
    scale = d3.scale.linear()
                .domain([0, d3.max(dataset, function(d) { return d.num; })])
                .range([9, h]);
}

// create rect in svg
function setRects(set) {
    document.getElementById("graph").innerHTML = "";
    
    svg = d3.select("#graph")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
    
    var rects = svg.selectAll("rect")
                    .data(set)
                    .enter()
                    .append("rect");
    
    rects.attr("x", function(d, i) {
        return i * (w / set.length);
    });
    
    rects.attr("y", function(d, i) {
        return h - scale(d.num);
    });
    
    rects.attr("width", function(d, i) {
        return (w / set.length) - padding;
    });
    
    rects.attr("height", function(d, i) {
        return scale(d.num);
    });
    
    rects.attr("fill", function(d, i) {
        return colors[d.state];
    });
}

// redraw
function redrawRects(set) {
    var rects = svg.selectAll("rect")
                    .data(set)
                    .transition()
                    .duration(speed / 2 | 0)
    
    rects.attr("y", function(d, i) {
        return h - scale(d.num);
    });
    
    rects.attr("width", function(d, i) {
        return (w / set.length) - padding;
    });
    
    rects.attr("height", function(d, i) {
        return scale(d.num);
    });
    
    rects.attr("fill", function(d, i) {
        return colors[d.state];
    });
}

// selection change
document.getElementById("algo").addEventListener("change", function() {
    algo = this.value;
});

// reset
document.getElementById("reset").addEventListener("click", function() {
    clearInterval(timer);
    
    num = document.getElementById("num").value;
    speed = document.getElementById("speed").value;
    
    setDataset(num);
    setRects(dataset);
});

// play
document.getElementById("play").addEventListener("click", function() {
    clearInterval(timer);
    
    for (var i = dataset.length - 1; i >= 0; i--)
        dataset[i].state = states.default;
    
    algos[algo]();
});
