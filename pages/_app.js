import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2d3e50',
            color: '#fff',
          },
        }}
      />
    </Layout>
  )
}

