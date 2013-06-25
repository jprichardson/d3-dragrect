var __idCounter = 0
  , __selectedClass = 'selected'
  , __defaultClass = 'd3-dragrect'
  , __dragRects = {}
  , noop = function() {}

if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
  module.exports = createDragBehavior
}

createDragBehavior.dragRects = __dragRects
createDragBehavior.getLastRect = getLastRect

function getLastSelectedRect () {
  var id = __defaultClass + '-' + __idCounter
  var r = __dragRects[id]
  if (!r) {
    id = __defaultClass + '-' + (__idCounter - 1)
    r = __dragRects[id] || null
  }

  return r
}

/*function deleteSelection (id) {
  svg.selectAll(".selection.selected")
      .data([], function() {
        var id = d3.select(this).attr('id')
        id = id.replace('drag-rect', '')
        delete dragSelections[id]
        $scope.items = $scope.items.filter(function(d) {
          return d.id != id
        })
        $rootScope.$apply()
      })
      .exit()
      .remove()
}*/



function createDragBehavior (d3, svg, xScale, height) {
  d3 = d3 || window.d3

  function isInDragRect(p) {
    for (var k in __dragRects) {
      if (__dragRects.hasOwnProperty(k)) {
        var range = __dragRects[k]
        var curX = xScale.invert(p[0])
        if (range.start <= curX && curX <= range.end)
          return true
      }
    }

    return false
  }

  var dragStartCallback = noop
    , dragCallback = noop
    , dragEndCallback = noop

  var $drag = d3.behavior.drag()

  $drag.deleteAllSelected = function(callback) {
    var ids = []

    svg.selectAll("." + __defaultClass + ".selected")
      .data([], function() {
        var id = d3.select(this).attr('id')
        delete __dragRects[id]
        ids.push(id)
      })
      .exit()
      .remove()

    callback(ids)
  }

  $drag.on('dragstart', function() {
    //console.log('drag-start')
    var p = d3.mouse(this) //'this' here refers to svg
    if (isInDragRect(p)) return

    var args = Array.prototype.slice.call(arguments, 0)
    var id = __defaultClass + '-' + __idCounter

    svg.append('rect').attr({
      'class': __defaultClass,
      'id': id,
      'x': p[0],
      'y': 0,
      'height': height,
      'width': 1,
    }) //on click, visually highlight the rectangle
    .on('click', function() { //'this' in here is a ref to the svg
      var cls = d3.select(this).attr('class') 
      d3.select(this).attr('class', cls ===__defaultClass ? __defaultClass + ' ' + __selectedClass : __defaultClass)
    })

    __dragRects[id] = {start: xScale.invert(p[0]), end: null, id: id}

    dragStartCallback.apply(this, arguments)
  })

  $drag.on('drag', function() {
    //console.log('drag')

    var id = __defaultClass + '-' + __idCounter
    var s = svg.select('#' + id)
    if (s.empty()) return

    var args = Array.prototype.slice.call(arguments, 0)

    var p = d3.mouse(this)
    var d = {
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
    //console.log('drag-end')

    var p = d3.mouse(this) //'this' here refers to svg
    if (isInDragRect(p)) return

    var id = __defaultClass + '-' + __idCounter
    var s = svg.select('#' + id)
    if (s.empty()) return

    var args = Array.prototype.slice.call(arguments, 0)

    var p = d3.mouse(this)

    __dragRects[id].end = xScale.invert(p[0])

    dragEndCallback.apply(this, arguments)
  
    __idCounter += 1
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



