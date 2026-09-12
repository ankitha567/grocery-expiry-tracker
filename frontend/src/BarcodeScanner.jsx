import { useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

function BarcodeScanner({ onScanSuccess, onClose }) {
  const [decoding, setDecoding] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setDecoding(true)
    const fileScanner = new Html5Qrcode('barcode-reader-file')

    fileScanner
      .scanFile(file, true)
      .then((decodedText) => {
        setDecoding(false)
        onScanSuccess(decodedText)
      })
      .catch((err) => {
        setDecoding(false)
        console.error('File scan failed:', err)
        alert('Could not read a barcode from that photo. Try a clearer, closer shot.')
      })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-sm w-full">
        <h3 className="text-center font-semibold text-gray-800 mb-3">Scan Barcode</h3>

        <div id="barcode-reader-file" style={{ display: 'none' }} />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="w-full border rounded px-3 py-2 mb-2"
        />
        {decoding && <p className="text-sm text-gray-500 text-center">Decoding photo...</p>}
        <p className="text-xs text-gray-400 text-center mt-2">
          Tap to open camera, take a clear close-up photo of the barcode
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 text-white rounded px-4 py-2 font-semibold hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default BarcodeScanner