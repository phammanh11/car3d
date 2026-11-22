import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('APEX Atelier Uncaught Runtime Error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#050608] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-lg w-full bg-neutral-900/90 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-red-950/40 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 mb-6 text-2xl font-black">
              !
            </div>
            <h2 className="text-xl font-bold tracking-wider uppercase text-white mb-2">
              Khởi tạo đồ họa 3D bị gián đoạn
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Trình duyệt hoặc phần cứng đồ họa WebGL cần khởi động lại để nạp đầy đủ shader và mô hình 3D cao cấp.
            </p>
            {this.state.error && (
              <pre className="text-left text-[11px] font-mono text-red-300/80 bg-black/60 p-3 rounded-lg border border-red-500/20 overflow-x-auto max-h-36 mb-6">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-900/50 transition-all active:scale-[0.98]"
            >
              Khởi động lại Showroom 3D
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
