import * as pdfjs from 'pdfjs-dist'

// @NOTE: required to properly setup worker script
// @TODO: maybe move to configuration file such as _app.tsx
pdfjs.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js'

interface IPayload {
  /**
   * @description If provided then it will download and open file by default
   * @url "anyurl.com/*.pdf"
   */
  pdfFileUrl?: string

  /**
   * @description If provided then it will open file by default.
   * @url fetch("anyurl.com/*.pdf").then((response) => response.arrayBuffer())
   */
  pdfFileArrayBuffer?: ArrayBuffer

  /**
   * @description Page index to get cover. Starts at 0.
   * @default 0.
   */
  pageIndex?: number

  /**
   * @description Required width in pixels to render.
   */
  width: number
}

/**
 * @description Generates thumbnail for provided index page in required width.
 * 1. Create enew instance of PdfViewer;
 * 2. Listen to classList changes of root node;
 * 3. Once state changed to 'rendered' grab thumbnail in required format;
 * 4. Return thumbnail;
 * 5. Cleanup rendering tree.
 * @returns Image in Blob format.
 * @example const blob = await generatePDFCover({
 *   pdfFileUrl: '/FoxitPDFSDKforWeb_DemoGuide.pdf',
 *   width: 1920
 * })
 */
export async function generatePDFCover({
  pdfFileUrl,
  pdfFileArrayBuffer,
  width,
  pageIndex = 0,
}: IPayload): Promise<Blob> {
  return new Promise<Blob>(async (resolve) => {
    const doc = await (async () => {
      if (pdfFileUrl != null) {
        return pdfjs.getDocument(pdfFileUrl).promise
      }

      if (pdfFileArrayBuffer != null) {
        return pdfjs.getDocument(pdfFileArrayBuffer).promise
      }

      throw new Error('pdfFileUrl or pdfFileArrayBuffer are required')
    })()

    const coverPage = await doc.getPage(pageIndex + 1)
    const [_1, _2, viewportWidth, viewportHeight] =
      coverPage.getViewport().viewBox
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = (width / viewportWidth) * viewportHeight
    const scaledViewport = coverPage.getViewport({
      scale: Math.min(
        canvas.width / viewportWidth,
        canvas.height / viewportHeight
      ),
    })
    await coverPage.render({
      canvasContext: canvas.getContext('2d')!,
      viewport: scaledViewport,
    }).promise
    canvas.toBlob((blob) => {
      resolve(blob!)
      canvas.remove()
    })
  })
}
