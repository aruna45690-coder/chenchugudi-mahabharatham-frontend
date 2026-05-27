import { ImageResponse } from 'next/og';
 
// Route segment config
export const runtime = 'edge';
 
// Image metadata
export const alt = 'Chenchugudi Mahabharatham Festival';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #3D0000 0%, #1a0000 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 60%)',
          }}
        />
        
        {/* Om Symbol */}
        <div
          style={{
            fontSize: '120px',
            color: '#FFD700',
            marginBottom: '20px',
            lineHeight: 1,
            textShadow: '0 0 40px rgba(255,215,0,0.5)',
          }}
        >
          ॐ
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 900,
            color: '#FFD700',
            textAlign: 'center',
            letterSpacing: '0.1em',
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}
        >
          Chenchugudi
        </div>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '40px',
          }}
        >
          Mahabharatham
        </div>

        {/* Dates */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,215,0,0.1)',
            border: '2px solid rgba(255,215,0,0.3)',
            padding: '20px 40px',
            borderRadius: '100px',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#FFD700',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          🗓️ 65th Annual Festival: May 29 - June 7
        </div>

        {/* Villages */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Uniting 24 Villages · Vedurukuppam Mandal
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
