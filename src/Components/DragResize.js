
import React, { useEffect } from 'react'
import {setActiveClass} from "../Functions/adjustingUi"

/**
 * [Remove & destroy data DnD Resize and element]
 * @param {[props]} => property element
 * @props {node,initFuction,dataPerPage}
 * node => node data cordinate from addSignatureElement
 * initFuction => init the Draggable and Resizeable
 * dataPerPage => state datas per page from addSignatureElement
 */
const DragResizeComponent = (props) => {
    const {node,initFuction,dataPerPage} = props
    const {x,y,width,height,id,isInit} = node
    useEffect(() => {
      initFuction(node)
      setActiveClass(document.getElementById(node.id))
      dataPerPage.map(res => {
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

export default DragResizeComponent