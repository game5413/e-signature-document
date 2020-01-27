/**
 * [Prevent overflowing the canvas]
 * @param {[wrapper]} => node element 
 */
const preventOverflow = wrapper => {
  for (let index = 0; index < wrapper.childNodes.length-1; index++) {
    let child = wrapper.childNodes[index]
    child.onmouseup = () => {
      let rect1 = child.getBoundingClientRect()
      let rect2 = wrapper.getBoundingClientRect()
      let leftOverflow = rect1.left < rect2.left
      let rightOverflow =  rect1.right > rect2.right
      let topOverflow = rect1.top < rect2.top
      let bottomOverflow = rect1.bottom > rect2.bottom
      var isOverflow = (rect1.left < rect2.left || rect1.right > rect2.right ||rect1.top < rect2.top || rect1.bottom > rect2.bottom)        
      if(isOverflow) child.style.transition = "all .5s"

      /**
       * [Prevent oferflow]
       * @param {[direction]} => direction of element
       * @param {[type]} => type of calculate
       * @param {[distance]} => distance between child and parent if child overflowing the parent wrapper
       * @param {[boundary]} => child distance that overflowing the parent (Minus Value)
      */
      const overflowBoundary = (direction,type,distance,boundary) => {
          if(type === "plus") {
            return direction + (distance + Math.abs(boundary)) + "px"
          } else {
            return direction - (distance + Math.abs(boundary)) + "px"
          }
        }

      // Left Top Boundary
      if(leftOverflow && topOverflow) {
        child.style.left = overflowBoundary(child.offsetLeft,"plus",100,rect2.left - rect1.left)
        child.style.top =  overflowBoundary(child.offsetTop,"plus",100,rect1.top - rect2.top)
      }
      // Right Top Boundary 
      else if(rightOverflow && topOverflow) {
        child.style.left = overflowBoundary(child.offsetLeft,"min",100,rect2.right - rect1.right)
        child.style.top =  overflowBoundary(child.offsetTop,"plus",100,rect1.top - rect2.top)
      // Right Bottom Boundary 
      } else if(leftOverflow && bottomOverflow) {
        child.style.left = overflowBoundary(child.offsetLeft,"plus",100,rect2.left - rect1.left)
        child.style.top =  overflowBoundary(child.offsetTop,"min",100,rect2.bottom - rect1.bottom)
      } 
      // Right Top Boundary
      else if(rightOverflow && bottomOverflow) {
        child.style.left = overflowBoundary(child.offsetLeft,"min",100,rect2.right - rect1.right)
        child.style.top =  overflowBoundary(child.offsetTop,"min",100,rect2.bottom - rect1.bottom)
      }
      // Left Boundary
      else if(leftOverflow) {
        child.style.left = overflowBoundary(child.offsetLeft,"plus",100,rect2.left - rect1.left)
      } 
      // Right Boundary
      else if(rightOverflow) {
        child.style.left = overflowBoundary(child.offsetLeft,"min",100,rect2.right - rect1.right)
      } 
      //Top Boundary
      else if(topOverflow){
        child.style.top =  overflowBoundary(child.offsetTop,"plus",100,rect1.top - rect2.top)
      } 
      // Bottom Boundary
      else if(bottomOverflow){
        child.style.top =  overflowBoundary(child.offsetTop,"min",100,rect2.bottom - rect1.bottom)
      }

      //reset transition
      setTimeout(() => {
        child.style.transition = "none"
      }, 500);
    } 
  }
}

/**
 * [Set & unset class acrive]
 * @param {[type]} => node element || type of reset element  
 */
const setActiveClass = elmnt => {
  let parent = document.querySelector(".drop-area")
  // remove active class
  if(elmnt === "removeall") {
    for (let i = 0; i < parent.childNodes.length-1; i++) {
      parent.childNodes[i].classList.remove("active")
      parent.childNodes[i].childNodes[0].childNodes[1].style.display = "none"
      parent.childNodes[i].childNodes[0].childNodes[2].style.display = "none"
    }
  } else {
    for (let i = 0; i < parent.childNodes.length-1; i++) {
      parent.childNodes[i].classList.remove("active")
      parent.childNodes[i].childNodes[0].childNodes[1].style.display = "none"
      parent.childNodes[i].childNodes[0].childNodes[2].style.display = "none"
    }

    // set active class to current clicked element
    elmnt.classList.add("active")
    elmnt.childNodes[0].childNodes[1].style.display = "unset"
    elmnt.childNodes[0].childNodes[2].style.display = "unset"
  }
}

export {preventOverflow, setActiveClass}