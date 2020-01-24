import React, { useRef, useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import PdfGenerator from "./PdfGenerator"
import withWindowSize from "./withWindowSize"

const PdfComponent = ({ src, width, height }) => {
  const canvasRef = useRef(null)
  const dragableEl = useRef(null)
  const triggerEl = useRef(null)
  const [signaturePosition, setPosition] = useState({x:0,y:0})
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
    makeResizableDiv('.resizable')
  }, [src]);
 

  //set signature text
  const setSignature = param => {
    setSign(param)
    console.log(param)
    // let element = document.querySelector("#dragableEl")
    // element.style.display = "unset"
    // element.childNodes[0].innerHTML = param
  }

  //Make the DIV element draggagle:
  const dragElement = elmnt => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown

    function dragMouseDown(e) {
      e = e || window.event
      e.preventDefault()
      // get the mouse cursor position at startup:
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag
    }

    function elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
      setPosition({x:elmnt.offsetLeft,y:elmnt.offsetTop})
    }

    function closeDragElement() {
      //stop moving when mouse button is released
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  const next = _ => {
    console.log("NEXT")
    PdfGenerator.nextPage()
  }

  //Make the DIV element resizeable
  const makeResizableDiv = div => {
    const element = document.querySelector(div);
    const resizers = document.querySelectorAll(div + ' .resizer')
    const minimum_size = 20;
    let original_width = 0;
    let original_height = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;
    for (let i = 0;i < resizers.length; i++) {
      const currentResizer = resizers[i];
      currentResizer.addEventListener('mousedown', function(e) {
        e.preventDefault()
        original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
        original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResize)
      })
      
      const resize = e => {
        //Cancle the dragable function
        dragableEl.current.onmousedown = null
        document.onmouseup = null
        document.onmousemove = null

        //Make the div resizeable
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
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
      }
    }
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
        </div>
        <div className="content">
            <div className="drop-area">
              <div ref={dragableEl} className='resizable'>
                <div className='resizers'>
                  <img className="img-wrapper" src={signature}/>
                  <div className='resizer bottom-right'></div>
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