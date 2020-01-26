 /**
   * [Make the DIV element Resizable ]
   * @param {[elmnt]} => node element 
  */
 class MakeResizableDiv {
    constructor(elmnt) {
        this.elmnt = elmnt
        this.element = document.getElementById(elmnt)
        this.maximum_size = 300;
        this.original_width = 0;
        this.original_height = 0;
        this.original_mouse_x = 0;
        this.original_mouse_y = 0;
    }
    
    /**
     * [Make element available to Resizable ]
     * @param {[callback]} => callback to set in view
     */
    setResizable  = callback => {
        let currentResizer = ""
        currentResizer = this.element.childNodes[1].childNodes[3];
        currentResizer.onmousedown = e => {
            this.original_width = parseFloat(getComputedStyle(this.element, null).getPropertyValue('width').replace('px', ''));
            this.original_height = parseFloat(getComputedStyle(this.element, null).getPropertyValue('height').replace('px', ''));
            this.original_mouse_x = e.pageX;
            this.original_mouse_y = e.pageY;
            
            window.addEventListener('mousemove', this.resize)
            window.addEventListener('mouseup', node => this.stopResize({node,callback}))
        }
    }
    
    /**
     * [resizing the element]
     * @param {[node]} => mousemove node element property
     */
    resize = node => {
      // cancle the dragable function
      document.onmouseup = null
      document.onmousemove = null

      // calculate the resize element
      const width = this.original_width + (node.pageX - this.original_mouse_x);
      const height = this.original_height + (node.pageY - this.original_mouse_y)
      
      // max width,height 300px
      if (width < this.maximum_size) {
        this.element.style.width = width + 'px'
      } 
      if (height < this.maximum_size) {
        this.element.style.height = height + 'px'
      }
    }
    
    /**
     * [Stop resizing when onMouseLeave]
     * @return {[void]}
     * @param {[node]} => node property
     */
    stopResize = node => {
        const {callback} = node
        window.removeEventListener('mousemove', this.resize)
        if(this.element) {
            // return element to callback
            return callback(this.element)
        }
    }
  }

  export default MakeResizableDiv