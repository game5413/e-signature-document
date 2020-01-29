import React, { useRef, useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import PdfGenerator from "./PdfGenerator"
import withWindowSize from "./withWindowSize"
import MakeResizableDiv from './Functions/resizer'
import MakeDraggableDiv from './Functions/draggable'
import {setActiveClass} from "./Functions/adjustingUi"
import DragResizeComponent from "./Components/DragResize"

const PdfComponent = ({ src, width, height }) => {
  const canvasRef = useRef(null)
  const [signature, setSign] = useState("")
  const [signatureData, setData] = useState([
    "https://i.ibb.co/Lt2vdhd/18-02-08-17-29-50-859-deco.jpg",
    "https://i.ibb.co/ZJGb55v/screen-0-jpg-fakeurl-1-type.jpg",
    "https://i.ibb.co/10YCd1c/method-draw-image.png"
  ])
  const [totalPage, setTotalPages] = useState(0)
  const [currentPage, setPage] =  useState(1)
  const [dataPerPage, setDataPerpage] = useState({})

  useEffect(() => {
    const fetchPdf = async () => {
      await PdfGenerator.loadDocument(src)
      await PdfGenerator.render(canvasRef.current, { scale:1.7 })
      setTotalPages(await PdfGenerator.pages)
    };
    fetchPdf();

    // let wrapper = document.querySelector(".drop-area")
    // wrapper.onmousemove =  _ => preventOverflow(wrapper)
    let abandoned = document.querySelector(".abandoned-wrapper")
    abandoned.onclick = _ => setActiveClass("removeall")
  }, [src]);

   /**
   * [Add new DnD & resize element]
   * and put them on Array of obj
   * then set them to dataPerPage state
   */
  const addSignatureElement = _ => {
    let randomId = Math.random().toString(36).substring(7);
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
    const newData = {
      ...dataPerPage,
      [currentPage]: data
    }
    setDataPerpage(newData)    
  }

  /**
   * [Inet elemet function]
   * set active class when clicking on it
   * remove the element when clicking on the close btn
   * make element available to drag
   * make element available to resize
   * @param {[element]} => node element 
   */
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
            const {left,top,width,height} = callback.style
            res.x = parseInt(left.replace("px",""))
            res.y = parseInt(top.replace("px",""))
            res.width = parseInt(width.replace("px",""))
            res.height = parseInt(height.replace("px",""))
          }
        })
      })

      // init resize element and set data while resizing element
      let resizeElement = new MakeResizableDiv(node.id)
      resizeElement.setResizable(callback => {
        dataPerPage[currentPage].filter(res => {
          if(res.id === callback.id) {
            const {left,top,width,height} = callback.style
            res.x = parseInt(left.replace("px",""))
            res.y = parseInt(top.replace("px",""))
            res.width = parseInt(width.replace("px",""))
            res.height = parseInt(height.replace("px",""))
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

  const changePdfPage = type => {
    let totalPage = document.querySelector(".wrapper-total-page")
    totalPage.childNodes[0].classList.add("scaled-change")
    setTimeout(() => {
      totalPage.childNodes[0].classList.remove("scaled-change")
    }, 400);
    
    if(type === "prev") {
      PdfGenerator.prevPage()
      setPage(PdfGenerator.activePage)
    } else {
      PdfGenerator.nextPage()
      setPage(PdfGenerator.activePage)
    }
  }

  let isDone = 0;
  const saveCanvas = _ => {
    dataPerPage[currentPage].map((res,index) => {
      let canvas = canvasRef.current;
      let context = canvas.getContext("2d");
      let img = new Image();
      img.crossOrigin = "anonymous";
      img.src = res.signature

      setTimeout(() => {
        isDone++
        context.drawImage(img, res.x,res.y, res.width,  res.height)
        console.log(isDone, dataPerPage[currentPage].length)
        if(isDone === dataPerPage[currentPage].length) {
          setTimeout(() => {
            downloadCanvas()
          }, 200);
        }
      }, 100);
    })
  }

  const downloadCanvas = _ => {
    let tagA = document.createElement("a")
    let canvas = canvasRef.current
    document.body.appendChild(tagA)
    tagA.href  = canvas.toDataURL()
    tagA.download = "canvas-image.png"
    tagA.click()
    document.body.removeChild(tagA)
  }
 
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Create <code>e-signed document</code> and save.
        </p>
        <div className="wrapper-page-btn btn-wrapper">
          <a className="prev-btn p0-m0" onClick={() => changePdfPage("prev")}>
            <span className="naxt-prev-btn">&#x2039;</span>
          </a>
          <div className="wrapper-total-page">
            <span>{currentPage}</span>
            <span>  /  </span>
            <span>{totalPage}</span>
          </div>
          <a className="next-btn right-0 p0-m0" onClick={() => changePdfPage("next")}>
            <span className="naxt-prev-btn">&#x203A;</span>
          </a>
        </div>
      </header>

      <div className="max-wrapper">
        <div style={{display: "flex", flexDirection: "row", height: '100%', overflow: "hidden"}}>
          <div className="left-container">
            <div className="btn-wrapper">
              {signatureData.map((result,indx) => {
                return <a key={indx} onClick={_ => selectSignature(result,indx,"items")}>Signature {indx+1}</a>
              })}
            </div>
            <div style={{marginTop:50}} className="btn-wrapper" id="button-wrapper">
              <a onClick={_ => selectSignature(null, 0,"button")}>Set Signature</a>
              <a onClick={() => saveCanvas()}>Save as Img</a>
            </div>
          </div>
          <div className="content">
              <div className="drop-area">
                {dataPerPage[currentPage] && dataPerPage[currentPage].map((res,indx) => {
                  return <DragResizeComponent 
                          key={indx} 
                          initFuction={e => initializeFunction(e)} 
                          node={res}
                          dataPerPage ={dataPerPage[currentPage]}/> 
                })}
                <div className="abandoned-wrapper"></div>
              </div>
              <div><canvas ref={canvasRef} /></div>
          </div>
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