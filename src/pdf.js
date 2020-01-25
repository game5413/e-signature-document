import React, { useRef, useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import PdfGenerator from "./PdfGenerator"
import withWindowSize from "./withWindowSize"
import MakeResizableDiv from './resizer'
import MakeDraggableDiv from './draggable'

const PdfComponent = ({ src, width, height }) => {
  const canvasRef = useRef(null)
  const [signatureProps, setPosition] = useState({x:100,y:100,width:100,height:100})
  const [dataSignature, setDataSignature] = useState([])
  const [signature, setSign] = useState("")
  const [signatureData, setData] = useState([
    "https://kilausenja.com/wp-content/uploads/2019/04/18-02-08-17-29-50-859_deco.jpg",
    "https://image.winudf.com/v2/image1/Y29tLnlva29hcHB4LnNpZ25hdHVyZW1ha2VyX3NjcmVlbl8wXzE1NTc1MTA4NjhfMDIw/screen-0.jpg?fakeurl=1&type=.jpg",
    "http://www.best-signature.com/wp-content/uploads/2017/01/e20_2.jpg"
  ])
  const [dataDropElements, setElements] =  useState([])

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

    let wrapper = document.querySelector(".drop-area")
    let abandoned = document.querySelector(".abandoned-wrapper")
    wrapper.onmousemove =  _ => cancleOverflowing(wrapper)
    abandoned.onclick = _ => setActiveClass("removeall")
  }, [src]);
 
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

   /**
   * [Add new DnD & resize element]
   */
  const addSignatureElement = _ => {
    let parent = document.querySelector(".drop-area")
    let randomId = Math.random().toString(36).substring(7);
    let node = document.createElement("div")

    // remove prev element active class
    setActiveClass("removeall")

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

    // add event click on close btn [selcetor => .resizers]
    node.childNodes[1].onmousedown = _ => setActiveClass(node)
    node.childNodes[1].childNodes[5].onclick = _ => removeSignatureElement(node)
    
    // init draggable element and set data while dragging element
    // dragElement(document.getElementById(node.id))
    let draggableElement = new MakeDraggableDiv(node.id)
    draggableElement.setDraggable(callback => {
      dataDropElements.filter(res => {
        if(res.id === callback.id) {
          res.x = callback.offsetLeft
          res.y = callback.offsetTop
          res.width = callback.offsetWidth
          res.height = callback.offsetHeight
        }
      })
      setPosition({
        x:callback.offsetLeft,
        y:callback.offsetTop,
        width:callback.offsetWidth,
        height:callback.offsetHeight
      })
    })
    // init resize element and set data while resizing element
    let resizeElement = new MakeResizableDiv(node.id)
    resizeElement.setResizable(callback => {
      dataDropElements.filter(res => {
        if(res.id === callback.id) {
          res.x = callback.offsetLeft
          res.y = callback.offsetTop
          res.width = callback.offsetWidth
          res.height = callback.offsetHeight
        }
      })
      setPosition({
        x:callback.offsetLeft,
        y:callback.offsetTop,
        width:callback.offsetWidth,
        height:callback.offsetHeight
      })
    })    

    dataDropElements.push({
      id: node.id,
      x:100,
      y:100,
      width:100,
      height:100,
      node: node
    })
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
  
  /**
   * [Remove & destroy data DnD Resize and element]
   * @param {[elmnt]} => node element 
   */
  const removeSignatureElement = elmnt => {
    dataDropElements.filter((res,indx) => {
      if(res.id === elmnt.id) {
        dataDropElements.splice(indx,1)
      }
    })
    elmnt.classList.add("remove")
    setTimeout(() => {
      elmnt.remove()
    }, 500);
  }

  function printLocation(params) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    var img = new Image;
    img.src = signature
    context.drawImage(img, signatureProps.x, signatureProps.y, signatureProps.width,  signatureProps.height);
    let element = document.querySelector(".resizable.dragable.active")
    // console.log(element)
    element.style.display = "none"
  }

  const next = _ => {
    console.log("NEXT")
    PdfGenerator.nextPage()
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
            return <span key={indx} onClick={_ => setSign(result)}>Signature {indx+1}</span>
          })}
          <button onClick={() => printLocation()}>Print</button>
          <div style={{marginTop:50}}>
            <span onClick={_ => addSignatureElement("signature")}>Signature</span>
            <span onClick={_ => console.log(dataDropElements)}>Initial</span>
          </div>
        </div>
        <div className="content">
            <div className="drop-area">
              <div className="abandoned-wrapper"></div>
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