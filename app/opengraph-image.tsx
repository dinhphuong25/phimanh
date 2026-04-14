import { ImageResponse } from 'next/og';

export const alt = 'Rạp Phim Chill - Kho phim HD chất lượng cao miễn phí';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #111111, #000000)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '80px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(220, 165, 30, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', zIndex: 1 }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              background: '#eab308', // primary yellow
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
              boxShadow: '0 10px 30px rgba(234, 179, 8, 0.3)',
            }}
          >
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" fill="#000" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-2px',
              color: '#ffffff',
              display: 'flex',
            }}
          >
            Rạp Phim Chill
          </h1>
        </div>
        
        <p
          style={{
            fontSize: '36px',
            fontWeight: 500,
            color: '#a1a1aa', // text-muted
            margin: '0 0 60px 0',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            zIndex: 1,
            display: 'flex',
          }}
        >
          Khám phá hơn 50,000+ bộ phim HD chất lượng cao thuộc mọi thể loại. Hoàn toàn miễn phí.
        </p>
        
        <div
          style={{
            display: 'flex',
            gap: '20px',
            zIndex: 1,
          }}
        >
          {['Phim Mới', 'Phim Lẻ', 'Phim Bộ', 'Chiếu Rạp'].map((text) => (
            <div
              key={text}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 24px',
                borderRadius: '100px',
                fontSize: '24px',
                color: '#eab308',
                display: 'flex',
              }}
            >
              {text}
            </div>
          ))}
        </div>
        
        <div style={{ position: 'absolute', bottom: '40px', fontSize: '24px', color: '#52525b', display: 'flex' }}>
          rapphimchill.pro
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
