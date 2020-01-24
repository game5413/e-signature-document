import React from "react"

const withWindowSize = Component => {
    function innerWindowSize() {
        const [windowWidth, setWidth] = React.useState(window.innerHeight)
        const [windowHeight, setHeight] = React.useState(window.innerWidth)
        function resize(event) {
            setHeight(event.target.innerHeight)
            setWidth(event.target.innerWidth)
        }
        React.useEffect(() => {
            window.addEventListener("resize", resize, false)
        }, [])
        React.useEffect(() => {
            return function cleanup() {
                window.removeEventListener("resize", resize, false)
            }
        }, [])
        return <Component width={windowWidth} height={windowHeight} />
    }
    innerWindowSize.displayName = `withWindowSize(${Component.displayName || Component.name || 'Component'})`
    return innerWindowSize
}

export default withWindowSize