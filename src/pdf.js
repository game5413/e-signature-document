import React, { useRef, useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import PdfGenerator from "./PdfGenerator"
import withWindowSize from "./withWindowSize"

const PdfComponent = ({ src, width, height }) => {
  const canvasRef = useRef(null)
  const dragableEl = useRef(null)
  const [signatureProps, setPosition] = useState({x:100,y:100,width:100,height:100})
  const [dataSignature, setDataSignature] = useState([])
  const [signature, setSign] = useState("")
  const [signatureData, setData] = useState([
    "https://upload.wikimedia.org/wikipedia/commons/9/93/Signature_of_Professor_Muhammad_Yunus.svg",
    "https://image.winudf.com/v2/image1/Y29tLnlva29hcHB4LnNpZ25hdHVyZW1ha2VyX3NjcmVlbl8wXzE1NTc1MTA4NjhfMDIw/screen-0.jpg?fakeurl=1&type=.jpg",
    "http://www.best-signature.com/wp-content/uploads/2017/01/e20_2.jpg"
  ])
  
  useEffect(() => {
    const fetchPdf = async () => {
      await PdfGenerator.loadDocument(src)
      const viewport = PdfGenerator.setViewPort({ scale: 1.5 })
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await PdfGenerator.render(context, viewport)
    };

    fetchPdf();
    dragElement(dragableEl.current)
    makeResizableDiv(dragableEl.current.id,"didmount")

    let wrapper = document.querySelector(".drop-area")
    wrapper.addEventListener("mousemove", _ => cancleOverflowing(wrapper)) 
  }, [src]);
 
  /**
   * [Set signature image to display]
   * @param {[data]} => data image to display 
  */
  const setSignature = data => {
    setSign(data)
    let element = document.querySelector(".resizable")
    element.style.display = "unset"
  }

  /**
   * [Make the DIV element draggagle]
   * @param {[elmnt]} => node element 
  */
  const dragElement = elmnt => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown

    function dragMouseDown(e) {
      e = e || window.event
      e.preventDefault()
      // get the mouse cursor position at startup:
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = cancleDragElement
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag
    }

    function elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      // set the element's new position
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"

      setPosition({
        x:elmnt.offsetLeft,
        y:elmnt.offsetTop,
        width:elmnt.offsetWidth,
        height:elmnt.offsetHeight
      })
    }

    function cancleDragElement() {
      // stop moving when mouse is released
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  /**
   * [Make the DIV element resizeable]
   * @param {[elmnt]} => node element 
  */
  const makeResizableDiv = (elmnt,type) => {
    const element = document.getElementById(elmnt)
    const maximum_size = 300;
    let original_width = 0;
    let original_height = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;
 
    let currentResizer = ""
    if(type === "didmount") {
      currentResizer = element.childNodes[0].childNodes[1]
    } else {
      currentResizer = element.childNodes[1].childNodes[3];
    }
    currentResizer.addEventListener('mousedown', function(e) {
      e.preventDefault()
      original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)
    })
    
    /**
     * [resizing the element]
     * @param {[node]} => mousemove node element property
     */
    const resize = node => {
      // cancle the dragable function
      dragableEl.current.onmousedown = null
      document.onmouseup = null
      document.onmousemove = null

      // calculate the resize element
      const width = original_width + (node.pageX - original_mouse_x);
      const height = original_height + (node.pageY - original_mouse_y)
      
      // max width,height 300px
      if (width < maximum_size) {
        element.style.width = width + 'px'
      } 
      if (height < maximum_size) {
        element.style.height = height + 'px'
      }
    }
    
    /**
     * [Stop resizing when onMouseLeave]
     * @return {[void]}
     * @callback {[func]} dragElement
     */
    const stopResize = _ => {
      window.removeEventListener('mousemove', resize)
      dragElement(dragableEl.current)
      
      let element = dragableEl.current
      setPosition({
        x:element.offsetLeft,
        y:element.offsetTop,
        width:element.offsetWidth,
        height:element.offsetHeight
      })
    }
  
  }

  /**
   * [Prevent overflowing the canvas]
   * @param {[wrapper]} => node element 
  */
  const cancleOverflowing = wrapper => {
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


  function printLocation(params) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // context.font = "30px arial"
    // context.fillText("Here",signatureProps.x,signatureProps.y)
    var img = new Image;
    img.src = signature
    context.drawImage(img, signatureProps.x, signatureProps.y, signatureProps.width,  signatureProps.height);
    let element = document.querySelector(".resizable")
    element.style.display = "none"
 }
 
  const next = _ => {
    console.log("NEXT")
    PdfGenerator.nextPage()
  }

  const addSignatureElement = type => {
    let parent = document.querySelector(".drop-area")
    let randomId = Math.random().toString(36).substring(7);
    let node = document.createElement("div")
    node.id = randomId
    node.className = "resizable dragable active"
    node.innerHTML = `
      <div class="resizers">
        <img class="img-wrapper" src=${signature} />
        <div class="resizer bottom-right ${node.id}"></div>
        <div class='resizer-close top-right'>
          <span>x</span>
        </div>
      </div>
    `
    node.style.display = "unset"
    parent.appendChild(node)

    // add event click on close btn
    node.childNodes[1].childNodes[5].onclick = _ => node.remove()
    
    //init drag and resize
    dragElement(document.getElementById(node.id))
    makeResizableDiv(node.id)
  }
 

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Create <code>e-signed document</code> and save.
        </p>
        <div className="wrapper-page-btn">
          <div className="prev-btn"></div>
          <div className="next-btn right-0" onClick={() => next()}></div>
        </div>
      </header>

      <div style={{display: "flex", flexDirection: "row", height: '100%', overflow: "hidden"}}>
        <div className="left-container">
          {signatureData.map((result,indx) => {
            return <span key={indx} onClick={_ => setSignature(result)}>Signature {indx+1}</span>
          })}
          <button onClick={() => printLocation()}>Print</button>
          <div style={{marginTop:50}}>
            <span onClick={_ => addSignatureElement("signature")}>Signature</span>
            <span onClick={_ => "init"}>Initial</span>
          </div>
        </div>
        <div className="content">
            <div className="drop-area">
              <div ref={dragableEl} className="resizable dragable" id="resizable">
                <div className="resizers">
                  <img className="img-wrapper" src={signature}/>
                  <div className="resizer bottom-right"></div>
                  <div className='resizer-close top-right'>
                    <span>x</span>
                  </div>
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

PdfComponent.propTypes = {
  src: PropTypes.string
};

PdfComponent.defaultProps = {
  src: `${process.env.PUBLIC_URL}/test.pdf`
};

export default withWindowSize(PdfComponent);