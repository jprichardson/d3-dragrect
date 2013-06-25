var __d3dr_selectedClass = 'selected'
  , __d3dr_defaultClass = 'd3-dragrect'
  , noop = function() {}

if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
  module.exports = createDragBehavior
}

function createDragBehavior (d3, svg, xScale, height) {
  d3 = d3 || window.d3

  var dragStartCallback = noop
    , dragCallback = noop
    , dragEndCallback = noop

  var $drag = d3.behavior.drag()

  $drag.idCounter = 0
  $drag.dragRects = {}
  $drag.createRect = function(x, y, width, height, id) {
    id = id || (__d3dr_defaultClass + '-' + $drag.idCounter)

    var rect = svg.append('rect').attr({
      'class': __d3dr_defaultClass,
      'id': id,
      'x': x,
      'y': y,
      'height': height,
      'width': width,
    })

    return rect
  }

  $drag.getLastRectData = function  () {
    var id = __d3dr_defaultClass + '-' + $drag.idCounter
    var r = $drag.dragRects[id]
    if (!r) {
      id = __d3dr_defaultClass + '-' + ($drag.idCounter - 1)
      r = $drag.dragRects[id] || null
    }

    return r
}


  $drag.isPointInDragRect = function(p) {
    for (var k in $drag.dragRects) {
      if ($drag.dragRects.hasOwnProperty(k)) {
        var range = $drag.dragRects[k]
        var curX = xScale.invert(p[0])
        if (range.start <= curX && curX <= range.end)
          return true
      }
    }

    return false
  }  

  $drag.deleteAllSelected = function(callback) {
    var ids = []

    svg.selectAll("." + __d3dr_defaultClass + '.' + __d3dr_selectedClass)
      .data([], function() {
        var id = d3.select(this).attr('id')
        delete $drag.dragRects[id]
        ids.push(id)
      })
      .exit()
      .remove()

    callback(ids)
  }

  $drag.on('dragstart', function() {
    var p = d3.mouse(this) //'this' here refers to svg
    if ($drag.isPointInDragRect(p)) return

    var id = __d3dr_defaultClass + '-' + $drag.idCounter

    var rect = $drag.createRect(p[0], 0, 1, height)
    //on click, visually highlight the rectangle
    rect.on('click', function() { //'this' in here is a ref to the rect
      var cls = d3.select(this).attr('class') 
      d3.select(this).attr('class', cls === __d3dr_defaultClass ? __d3dr_defaultClass + ' ' + __d3dr_selectedClass : __d3dr_defaultClass)
    })

    $drag.dragRects[id] = {start: xScale.invert(p[0]), end: null, id: id}

    dragStartCallback.apply(this, arguments)
  })
  .on('drag', function() {
    var id = __d3dr_defaultClass + '-' + $drag.idCounter
    var s = svg.select('#' + id)
    if (s.empty()) return

    var p = d3.mouse(this)
    var d = { //dimensions
          x: parseInt(s.attr('x'), 10),
          width: parseInt(s.attr('width'), 10)
        }
    var move = {
          x: p[0] - d.x
        }

    if( move.x < 1 || (move.x*2<d.width)) {
      d.x = p[0];
      d.width -= move.x;
    } else {
      d.width = move.x;       
    }

    s.attr(d)

    dragCallback.apply(this, arguments)
  })

  $drag.on('dragend', function() {
    var p = d3.mouse(this) //'this' here refers to svg
    if ($drag.isPointInDragRect(p)) return

    var id = __d3dr_defaultClass + '-' + $drag.idCounter
    var s = svg.select('#' + id)
    if (s.empty()) return

    $drag.dragRects[id].end = xScale.invert(p[0])

    dragEndCallback.apply(this, arguments)
  
    $drag.idCounter += 1
  })

  $drag.on = function(type, cb) {
    switch (type) {
      case 'dragstart': 
        dragStartCallback = cb
        break
      case 'drag':
        dragCallback = cb
        break
      case 'dragend':
        dragEndCallback = cb
        break
    }
  }

  return $drag
}



