import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 96, height: 96 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#dc2626', // Tailwind red-600
          borderRadius: '18px',
        }}
      >
        <svg
          width="54"
          height="54"
          viewBox="0 0 24 24"
          fill="white"
          style={{ marginLeft: '6px' }}
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
