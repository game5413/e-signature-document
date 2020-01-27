import pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

class PdfGenerator {
    constructor() {
        this.pdfjs = pdfjs
        this.pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker
        this.active = null
        this.pdf = null
        this.page = 0
        this.pages = 0
        this.src = ""
        this.canvas = null
    }

    /* GETTER */
    /**
     * [get displayed page]
     *
     * @return  {[integer]}  [active page]
     */
    get activePage() {
        return this.page
    }
    /**
     * [get total page of pdf]
     *
     * @return  {[integer]}  [total page]
     */
    get totalPage() {
        return this.pages
    }
    /**
     * [get viewport options]
     * @return {[object]} [current viewport]
     * */
    get viewportOptions() {
        return this._viewport
    }
    /**
     * [get canvas element for render]
     *
     * @return {[element]} [current element]
     * */
    get canvasElement() {
        return this._canvas
    }
    /* SETTER */
    /**
     * [set displayed page]
     *
     * @param   {[int]}  page  [value]
     *
     * @return  {[void]}
     */
    set activePage(page) {
        this.page = page
    }
    /**
     * [get total page of pdf]
     *
     * @param   {[int]}  total  [total page]
     *
     * @return  {[void]}
     */
    set totalPage(total) {
        this.pages = total
    }
    /**
     * [set viewport options]
     *
     * @param {[object]} viewport [viewport want to be saved]
     *
     * @return {[void]}
     * */
    set viewportOptions(viewport) {
        this._viewport = viewport
    }
    /**
     * [set canvas element for render]
     *
     * @param {[node]} viewport [viewport element]
     *
     * @return {[void]}
     * */
    set canvasElement(element) {
        this._canvas = element
    }

    async loadDocument(src = "") {
        try {
            if (!src) {
                return
            }
            if (this.src && this.src !== src) {
                this.activePage = 0
                await this.pdf.cleanup()
                await this.pdf.destroy()
            }
            this.src = src
            let docPDF = this.pdfjs.getDocument(src)
            this.active = await docPDF.promise
            this.totalPage = this.active.numPages
            this.activePage = 1
            this.pdf = await this.active.getPage(this.activePage)
            return true
        } catch(error) {
            console.log("load -> ", error)
        }
    }

    async loadPage() {
        try {
            this.pdf = await this.active.getPage(this.activePage)
            this.render()
            // this.render(this.canvasElement, this.viewportOptions)
        } catch(error) {
            console.log("loadPage -> ", error)
        }
    }

    nextPage() {
        try {
            const next = this.activePage + 1
            if (next > this.totalPage) {
                return
            }
            this.activePage = next
            this.loadPage()
        } catch(error) {
            console.log("nextPage -> ", error)
        }
    }

    prevPage() {
        try {
            const prev = this.activePage - 1
            if (!prev) {
                return
            }
            this.activePage = prev
            this.loadPage()
        } catch(error) {
            console.log("prevPage -> ", error)
        }
    }

    setViewPort(options = {}) {
        try {
            this.viewportOptions = options
            return this.pdf.getViewport(options)
        } catch(error) {
            console.log("setViewPort -> ", error)
        }
    }

    async render(canvasElement = null || this.canvasElement, viewportOpt = null || this.viewportOptions) {
        try {
            if (!canvasElement || !viewportOpt) {
                return
            }
            this.canvasElement = canvasElement
            const viewport = await this.setViewPort(viewportOpt)
            const canvas = canvasElement;
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            this.pdf.render({
                canvasContext: context,
                viewport
            })
        } catch(error) {
            console.log("render -> ", error)
        }
    }
}

export default new PdfGenerator()