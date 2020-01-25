/**
 * [Prevent overflowing the canvas]
 * @param {[wrapper]} => node element 
 */
 const preventOverflow = wrapper => {
    for (let index = 0; index < wrapper.childNodes.length; index++) {
      let child = wrapper.childNodes[index]
      child.onmouseup = () => {
        let rect1 = child.getBoundingClientRect()
        let rect2 = wrapper.getBoundingClientRect()
        var isOverflow = (rect1.left < rect2.left || rect1.right > rect2.right ||rect1.top < rect2.top || rect1.bottom > rect2.bottom)
  
        if(isOverflow) {
          child.style.transition = "all .5s"
          child.style.left = "120px"
          child.style.top = "150px"
          setTimeout(() => {
            child.style.transition = "none"
          }, 500);
        }
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
      for (let i = 1; i < parent.childNodes.length; i++) {
        parent.childNodes[i].classList.remove("active")
        parent.childNodes[i].childNodes[1].childNodes[3].style.display = "none"
        parent.childNodes[i].childNodes[1].childNodes[5].style.display = "none"
      }
    } else {
      for (let i = 1; i < parent.childNodes.length; i++) {
        parent.childNodes[i].classList.remove("active")
        parent.childNodes[i].childNodes[1].childNodes[3].style.display = "none"
        parent.childNodes[i].childNodes[1].childNodes[5].style.display = "none"
      }

      // set active class to current clicked element 
      elmnt.classList.add("active")
      elmnt.childNodes[1].childNodes[3].style.display = "unset"
      elmnt.childNodes[1].childNodes[5].style.display = "unset"
    }
  }

  export {preventOverflow, setActiveClass}