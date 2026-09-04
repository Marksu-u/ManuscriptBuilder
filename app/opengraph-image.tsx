import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { markSvg } from '@/lib/mark';
import { OG_ALT } from '@/lib/site';

export const runtime = 'nodejs';
export const alt = OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const fonts = [
  { name: 'Geist', data: readFileSync(join(process.cwd(), 'public/fonts/Geist-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
  { name: 'Geist', data: readFileSync(join(process.cwd(), 'public/fonts/Geist-SemiBold.ttf')), weight: 600 as const, style: 'normal' as const },
];

// A fixed product illustration, never a user's manuscript or account data.
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0B0E1A', color: '#E6EAF5', fontFamily: 'Geist', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 590, paddingLeft: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={`data:image/svg+xml;base64,${Buffer.from(markSvg(76)).toString('base64')}`} width={76} height={76} alt="" />
          <span style={{ color: '#93A2C4', fontSize: 17, letterSpacing: 2 }}>BAG OF HOLDING TOOLS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 30, fontSize: 64, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>
          <span>Manuscript</span><span>Builder</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22, fontSize: 27, lineHeight: 1.35, color: '#B3BFDA' }}>
          <span>Handouts for your</span><span>imagined worlds.</span>
        </div>
        <div style={{ width: 92, height: 2, background: '#EF9F27', marginTop: 30 }} />
        <div style={{ color: '#EF9F27', fontSize: 19, marginTop: 20 }}>Free to create. Yours to keep.</div>
      </div>

      <div style={{ display: 'flex', position: 'absolute', left: 607, top: 60, width: 545, height: 520 }}>
        <div style={{ display: 'flex', position: 'absolute', left: 270, top: 94, width: 235, height: 350, flexDirection: 'column', padding: 27, background: '#0D202A', border: '1px solid #347184', transform: 'rotate(9deg)', boxShadow: '0 20px 45px #00000066' }}>
          <span style={{ color: '#48DAFC', fontSize: 11, letterSpacing: 2 }}>TRANSMISSION 08.41</span>
          <div style={{ height: 1, background: '#347184', marginTop: 18, marginBottom: 24 }} />
          <span style={{ color: '#C8F5FF', fontSize: 25, fontWeight: 600, lineHeight: 1.2 }}>Beyond the outer rim</span>
          <span style={{ color: '#70AAB5', fontSize: 12, marginTop: 22, lineHeight: 1.6 }}>The signal repeats. A voice from a station that went dark thirty years ago.</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 23 }}>
            {[100, 85, 95, 58].map((width, i) => <div key={i} style={{ height: 2, width: `${width}%`, background: '#347184' }} />)}
          </div>
          <span style={{ color: '#48DAFC', fontSize: 10, marginTop: 26, letterSpacing: 2 }}>CLASSIFIED // 01</span>
        </div>

        <div style={{ display: 'flex', position: 'absolute', left: 22, top: 10, width: 308, height: 443, flexDirection: 'column', padding: '35px 31px', background: '#EADFC3', color: '#352719', transform: 'rotate(-7deg)', boxShadow: '0 24px 50px #00000088', border: '1px solid #F5EBD7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ height: 1, flex: 1, background: '#AE8860' }} />
            <div style={{ width: 7, height: 7, background: '#8E2F2C', transform: 'rotate(45deg)' }} />
            <div style={{ height: 1, flex: 1, background: '#AE8860' }} />
          </div>
          <span style={{ color: '#8E2F2C', fontSize: 9, letterSpacing: 2, marginTop: 22, textAlign: 'center' }}>BY ORDER OF THE CROWN</span>
          <span style={{ fontSize: 29, fontWeight: 600, lineHeight: 1.1, textAlign: 'center', marginTop: 18 }}>A summons to Blackmere Keep</span>
          <div style={{ height: 1, width: 83, background: '#AE8860', marginTop: 22, alignSelf: 'center' }} />
          <span style={{ fontSize: 12, lineHeight: 1.7, marginTop: 19 }}>On the first night of the waning moon, you are called to the old keep at Blackmere.</span>
          <span style={{ fontSize: 12, lineHeight: 1.7, marginTop: 12 }}>Bring neither herald nor banner. The roads are watched.</span>
          <span style={{ fontSize: 10, color: '#755E43', marginTop: 33 }}>By my hand and seal</span>
          <div style={{ display: 'flex', position: 'absolute', right: 26, bottom: 34, width: 56, height: 56, borderRadius: '50%', background: '#963B36', border: '3px solid #B8554B', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 6px #00000033' }}>
            <div style={{ width: 12, height: 12, background: '#EADFC3', transform: 'rotate(45deg)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 20, left: 31, width: 246, height: 1, background: '#AE8860' }} />
        </div>
      </div>
      <div style={{ display: 'flex', position: 'absolute', bottom: 26, right: 54, color: '#828FB2', fontSize: 14, letterSpacing: 2 }}>LETTERS · GRIMOIRES · DOSSIERS · DATAPADS</div>
    </div>,
    { ...size, fonts },
  );
}
