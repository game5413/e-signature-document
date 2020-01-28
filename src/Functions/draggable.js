import {preventOverflow} from "./adjustingUi"
  /**
   * [Make the DIV element Draggable]
   * @param {[elmnt]} => node element 
  */
 class MakeDragableDiv {
     constructor(elmnt) {
        this.element = document.getElementById(elmnt)
        this.pos1 = 0
        this.pos2 = 0
        this.pos3 = 0
        this.pos4 = 0
        this.boundaryCallback = null
        this.wrapper = document.querySelector(".drop-area")
     }

    /**
    * [Make element available to Draggable ]
    * @param {[callback]} => callback to set in view
    */
    setDraggable = callback => {
        this.element.onmousedown = e => {
            e = e || window.event
            e.preventDefault()
            // get the mouse cursor position at startup:
            this.pos3 = e.clientX
            this.pos4 = e.clientY
            document.onmouseup = this.cancleDragElement
            // call a function whenever the cursor moves:
            document.onmousemove = node => this.elementDrag(node,callback)
        }
    }

    /**
    * [Execute when dragging the element]
    * @param {[node, callback]} => 
    * node ==> onMouseMove properties
    * callback ==> callback to set in view
    */
    elementDrag = (node,callback) => {
        node = node || window.event
        node.preventDefault()
        // calculate the new cursor position
        this.pos1 = this.pos3 - node.clientX
        this.pos2 = this.pos4 - node.clientY
        this.pos3 = node.clientX
        this.pos4 = node.clientY
        // set the element's new position
        this.element.style.top = (this.element.offsetTop - this.pos2) + "px"
        this.element.style.left = (this.element.offsetLeft - this.pos1) + "px"
        this.wrapper.onmousemove =  
        _ => preventOverflow(this.wrapper, element => {
          if(element) {
            callback(element)
            return false
          }
        })
        // return element to callback
        callback(this.element)
    }

    /**
    * [Stop moving when mouse is released]
    */
    cancleDragElement = _ => {
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  export default MakeDragableDiv