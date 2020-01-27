import React, { useRef, useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import PdfGenerator from "./PdfGenerator"
import withWindowSize from "./withWindowSize"
import MakeResizableDiv from './Functions/resizer'
import MakeDraggableDiv from './Functions/draggable'
import {preventOverflow,setActiveClass} from "./Functions/adjustingUi"

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
  const [currentPage, setPage] =  useState(1)
  const [dataPerPage, setDataPerpage] = useState({})

  useEffect(() => {
    const fetchPdf = async () => {
      await PdfGenerator.loadDocument(src)
      await PdfGenerator.render(canvasRef.current, { scale:1.7 })
    };
    fetchPdf();

    let wrapper = document.querySelector(".drop-area")
    let abandoned = document.querySelector(".abandoned-wrapper")
    wrapper.onmousemove =  _ => preventOverflow(wrapper)
    abandoned.onclick = _ => setActiveClass("removeall")
  }, [src]);

 
   /**
   * [Add new DnD & resize element]
   */
  const addSignatureElement = _ => {
    let randomId = Math.random().toString(36).substring(7);
    let node = document.createElement("div")
    let data = [
      {
        id: randomId,
        x:100,
        y:100,
        width: 100,
        height: 100,
        signature: signature,
        isInit: false
      }
    ]
    if (dataPerPage[currentPage]) {
      data = [...dataPerPage[currentPage], ...data]
    }
    const test = {
      ...dataPerPage,
      [currentPage]: data
    }
    setDataPerpage(test)
    
    dataDropElements.push({
      id: node.id,
      x:100,
      y:100,
      width: 100,
      height: 100,
      nodeEl: node,
      signature: signature
    })
  }

  const DragResizeComponent = (props) => {
    const {node,initFuction} = props
    const {x,y,width,height,id,isInit} = node
    useEffect(() => {
      initFuction(node)
      setActiveClass(document.getElementById(node.id))
      dataPerPage[currentPage].map(res => {
        if(res.id === id) {
          res.isInit = true
        }
      })
    }, []) 
    return (
      <div 
        style={{ display:"unset", left:x,top:y,width:width,height:height }} 
        className={`resizable dragable active ${!isInit && "on-animate"}`} 
        id={node.id}>
        <div className="resizers">
          <img className="img-wrapper" src={node.signature} />
          <div className={`resizer bottom-right ${node.id}`}></div>
          <div className='resizer-close top-right'>
            <span>x</span>
          </div>
        </div>
      </div>
    )
  }  

  const initializeFunction = element => {
    [...document.querySelectorAll('.dragable')].map(res => {
      let node = document.getElementById(element.id)
      node.childNodes[0].onmousedown = _ => setActiveClass(node)
      node.childNodes[0].childNodes[2].onclick = _ => removeSignatureElement(node)

      // init draggable element and set data while dragging element
      let draggableElement = new MakeDraggableDiv(node.id)
      draggableElement.setDraggable(callback => {
        dataPerPage[currentPage].filter(res => {
          if(res.id === callback.id) {
            res.x = callback.offsetLeft
            res.y = callback.offsetTop
            res.width = callback.offsetWidth
            res.height = callback.offsetHeight
          }
        })
      })

      // init resize element and set data while resizing element
      let resizeElement = new MakeResizableDiv(node.id)
      resizeElement.setResizable(callback => {
        dataPerPage[currentPage].filter(res => {
          if(res.id === callback.id) {
            res.x = callback.offsetLeft
            res.y = callback.offsetTop
            res.width = callback.offsetWidth
            res.height = callback.offsetHeight
          }
        })
      })
      
    })
  }
  
  /**
   * [Remove & destroy data DnD Resize and element]
   * @param {[elmnt]} => node element 
   */
  const removeSignatureElement = elmnt => {
    let data = dataPerPage
    data[currentPage].filter((res,indx) => {
      if(res.id === elmnt.id) {
        data[currentPage].splice(indx,1)
      }
    })
    elmnt.classList.add("remove")
    setTimeout(() => {
      setDataPerpage(data)
    }, 500);
  }

  const selectSignature = (param,indexEl,type) => {
    if(type === "button") {
      let parent = document.querySelector("#button-wrapper")
      addSignatureElement("signature")
      for (let i = 0; i < parent.childNodes.length; i++) {
        if(indexEl === i) {
          parent.childNodes[i].classList.add("btn-active")
        } else {
          parent.childNodes[i].classList.remove("btn-active")
        }
      }
    } else {
      let parent = document.querySelector(".left-container")
      setSign(param)
      for (let i = 0; i < parent.childNodes[0].childNodes.length; i++) {
        if(indexEl === i) {
          parent.childNodes[0].childNodes[i].classList.add("btn-active")
        } else {
          parent.childNodes[0].childNodes[i].classList.remove("btn-active")
        }
      }
    }
  }

  function printLocation() {
    let parentWrapper = document.querySelector(".resizable.dragable.active")
    let newImg = parentWrapper.childNodes[1].childNodes[1].src
    let canvas = canvasRef.current
    let context = canvas.getContext('2d')
    let img = new Image
    img.src = newImg
    context.drawImage(img, parentWrapper.offsetLeft,parentWrapper.offsetTop, parentWrapper.offsetWidth,  parentWrapper.offsetHeight)
    parentWrapper.style.display = "none"
  }

  const changePdfPage = type => {
    if(type === "prev") {
      PdfGenerator.prevPage()
      setPage(PdfGenerator.activePage)
    } else {
      PdfGenerator.nextPage()
      setPage(PdfGenerator.activePage)
    }
  }
 
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Create <code>e-signed document</code> and save.
        </p>
        <div className="wrapper-page-btn">
          <div className="prev-btn" onClick={() => changePdfPage("prev")}></div>
          <div className="next-btn right-0" onClick={() => changePdfPage("next")}></div>
        </div>
      </header>

      <div style={{display: "flex", flexDirection: "row", height: '100%', overflow: "hidden"}}>
        <div className="left-container">
          <div className="btn-wrapper">
            {signatureData.map((result,indx) => {
              return <a key={indx} onClick={_ => selectSignature(result,indx,"items")}>Signature {indx+1}</a>
            })}
          </div>
          <div style={{marginTop:50}} className="btn-wrapper" id="button-wrapper">
            <a onClick={_ => selectSignature(null, 0,"button")}>Signature</a>
            <a onClick={_ => console.log(dataPerPage)}>Initial</a>
            <a onClick={() => printLocation()}>Instant Print</a>
          </div>
        </div>
        <div className="content">
            <div className="drop-area">
              {dataPerPage[currentPage] && dataPerPage[currentPage].map((res,indx) => {
                  return <DragResizeComponent 
                          key={indx} 
                          initFuction={e => initializeFunction(e)} 
                          node={res} /> 
              })}
              <div className="abandoned-wrapper"></div>
            </div>
            <div><canvas ref={canvasRef} /></div>
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