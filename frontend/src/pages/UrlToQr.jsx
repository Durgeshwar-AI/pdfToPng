import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import {
  Link as LinkIcon,
  Download,
  QrCode,
  Upload,
  Palette,
  Shapes,
  Type,
  Layout,
} from 'lucide-react';

const UrlToQr = () => {
  const [url, setUrl] = useState('');
  const [size, setSize] = useState(300);
  const [error, setError] = useState('');
  const [dotsType, setDotsType] = useState('rounded');
  const [cornersType, setCornersType] = useState('extra-rounded');
  const [dotsColor, setDotsColor] = useState('#4361ee');
  const [dotsColorSecondary, setDotsColorSecondary] = useState('#3b82f6');
  const [isGradient, setIsGradient] = useState(true);
  const [margin, setMargin] = useState(10);
  const [logo, setLogo] = useState(null);
  const [preset, setPreset] = useState('Modern');
  const [downloadExt, setDownloadExt] = useState('png');

  const qrRef = useRef(null);
  const qrCode = useRef(
    new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'canvas',
      margin: 10,
      data: 'https://example.com',
      dotsOptions: {
        color: '#4361ee',
        type: 'rounded',
      },
      backgroundOptions: {
        color: 'white',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
      },
    })
  );

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    if (!qrCode.current) return;

    qrCode.current.update({
      data: url || 'https://example.com',
      width: size,
      height: size,
      margin: margin,
      image: logo,
      backgroundOptions: {
        color: 'transparent',
      },
      dotsOptions: {
        color: dotsColor,
        type: dotsType,
        gradient: isGradient
          ? {
              type: 'linear',
              rotation: 0,
              colorStops: [
                { offset: 0, color: dotsColor },
                { offset: 1, color: dotsColorSecondary },
              ],
            }
          : null,
      },
      cornersSquareOptions: {
        type: cornersType,
        color: dotsColor,
      },
      cornersDotOptions: {
        type: cornersType === 'extra-rounded' ? 'dot' : cornersType === 'square' ? 'square' : 'dot',
        color: dotsColor,
      },
    });
  }, [url, size, dotsType, cornersType, dotsColor, dotsColorSecondary, isGradient, logo, margin]);

  const presets = {
    Classic: {
      dotsType: 'square',
      cornersType: 'square',
      dotsColor: '#000000',
      isGradient: false,
    },
    Modern: {
      dotsType: 'rounded',
      cornersType: 'extra-rounded',
      dotsColor: '#4361ee',
      dotsColorSecondary: '#3b82f6',
      isGradient: true,
    },
    Circle: {
      dotsType: 'dots',
      cornersType: 'dot',
      dotsColor: '#1a1a2e',
      isGradient: false,
      margin: 20,
    },
    Heart: {
      dotsType: 'extra-rounded',
      cornersType: 'dot',
      dotsColor: '#ff006e',
      dotsColorSecondary: '#ff5d8f',
      isGradient: true,
    },
    Instagram: {
      dotsType: 'rounded',
      cornersType: 'extra-rounded',
      dotsColor: '#833ab4',
      dotsColorSecondary: '#fd1d1d',
      isGradient: true,
    },
    Neon: {
      dotsType: 'classy',
      cornersType: 'extra-rounded',
      dotsColor: '#00f5d4',
      dotsColorSecondary: '#00bbf9',
      isGradient: true,
    },
    Business: {
      dotsType: 'classy-rounded',
      cornersType: 'square',
      dotsColor: '#2b2d42',
      dotsColorSecondary: '#8d99ae',
      isGradient: true,
    },
  };

  const handlePresetChange = name => {
    setPreset(name);
    const p = presets[name];
    setDotsType(p.dotsType);
    setCornersType(p.cornersType);
    setDotsColor(p.dotsColor);
    if (p.dotsColorSecondary) setDotsColorSecondary(p.dotsColorSecondary);
    setIsGradient(p.isGradient);
    setMargin(p.margin !== undefined ? p.margin : 10);
  };

  const validateUrl = value => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = ext => {
    qrCode.current.download({
      name: 'qr-code',
      extension: ext || downloadExt,
    });
  };

  const handleInputChange = e => {
    const value = e.target.value;
    setUrl(value);

    if (value === '') {
      setError('');
      return;
    }

    setError(validateUrl(value) ? '' : 'Please enter a valid URL.');
  };

  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setLogo(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="theme-panel mx-auto flex w-full max-w-[1000px] flex-col items-center overflow-hidden rounded-2xl p-6 text-center md:p-10">
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-[var(--color-app-text)]">
        URL to QR Code
      </h1>

      <p className="mb-8 max-w-lg text-gray-600">
        Convert website URLs into QR codes instantly. Generate, preview, customize size, and
        download your QR code as a PNG image.
      </p>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="w-full rounded-2xl border border-[#c7d2fe] bg-white p-6 text-left shadow-sm">
            <label className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase dark:text-white">
              <LinkIcon size={16} />
              Website URL
            </label>

            <input
              type="url"
              value={url}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-[#e2e8f0] bg-white p-3 transition-colors focus:border-[#4361ee] focus:ring-4 focus:ring-[#4361ee]/10 focus:outline-none dark:bg-slate-800 dark:text-white"
            />

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <div className="w-full rounded-2xl border border-[#c7d2fe] bg-white p-6 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase">
              <Shapes size={16} />
              Style Presets
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-3">
              {Object.keys(presets).map(name => (
                <button
                  key={name}
                  onClick={() => handlePresetChange(name)}
                  className={`rounded-lg px-3 py-2 text-[10px] font-bold tracking-tight uppercase transition-all ${
                    preset === name
                      ? 'scale-105 bg-[#4361ee] text-white shadow-md'
                      : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[#c7d2fe] bg-white p-6 text-left shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase">
              <Palette size={16} />
              Appearance
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Dots Style</label>
                <select
                  value={dotsType}
                  onChange={e => setDotsType(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-slate-50 p-2 text-sm focus:ring-2 focus:ring-[#4361ee]/20 focus:outline-none"
                >
                  {['square', 'rounded', 'dots', 'classy', 'classy-rounded', 'extra-rounded'].map(
                    t => (
                      <option key={t} value={t}>
                        {t.replace('-', ' ')}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Corners Style
                </label>
                <select
                  value={cornersType}
                  onChange={e => setCornersType(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-slate-50 p-2 text-sm focus:ring-2 focus:ring-[#4361ee]/20 focus:outline-none"
                >
                  {['square', 'dot', 'extra-rounded'].map(t => (
                    <option key={t} value={t}>
                      {t.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Primary Color
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-slate-50 p-1.5">
                  <input
                    type="color"
                    value={dotsColor}
                    onChange={e => setDotsColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer overflow-hidden rounded-md border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs font-medium">{dotsColor.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Gradient</label>
                  <input
                    type="checkbox"
                    checked={isGradient}
                    onChange={e => setIsGradient(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[#4361ee]"
                  />
                </div>
                <div
                  className={`flex items-center gap-3 rounded-lg border border-[#e2e8f0] p-1.5 transition-all ${isGradient ? 'bg-slate-50 opacity-100' : 'pointer-events-none bg-slate-100 opacity-40'}`}
                >
                  <input
                    type="color"
                    value={dotsColorSecondary}
                    onChange={e => setDotsColorSecondary(e.target.value)}
                    className="h-8 w-8 cursor-pointer overflow-hidden rounded-md border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs font-medium">
                    {dotsColorSecondary.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                <span className="rounded bg-[#4361ee] px-2 py-0.5 text-[10px] font-bold text-white">
                  {size}px
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="10"
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#4361ee]"
              />
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[#c7d2fe] bg-white p-6 text-left shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase">
              <Upload size={16} />
              Center Logo
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-500 transition-all hover:border-[#4361ee] hover:text-[#4361ee]"
                >
                  <Upload size={14} />
                  {logo ? 'Change Logo' : 'Upload Image'}
                </label>
              </div>
              {logo && (
                <button
                  onClick={() => setLogo(null)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-bold text-red-500 uppercase transition-colors hover:bg-red-100"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center lg:sticky lg:top-10">
          <div className="flex w-full flex-col items-center rounded-3xl border border-[#c7d2fe] bg-white p-8 shadow-xl">
            <div className="mb-5 flex items-center gap-2 font-semibold text-[#4361ee]">
              <QrCode size={20} />
              QR Code Preview
            </div>

            <div
              className={`flex aspect-square w-full max-w-[320px] items-center justify-center border border-slate-100 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 ${preset === 'Circle' ? 'rounded-full' : 'rounded-[2rem]'} ${preset === 'Heart' ? 'ring-8 ring-pink-50' : ''} ${preset === 'Neon' ? 'shadow-[0_0_40px_rgba(0,245,212,0.4)]' : ''} `}
            >
              <div
                ref={qrRef}
                className="rounded-inherit flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105 [&_canvas]:h-auto [&_canvas]:max-w-full"
              />
            </div>

            <div className="mt-10 w-full space-y-4">
              <div className="flex gap-2">
                <div className="group relative">
                  <select
                    value={downloadExt}
                    onChange={e => setDownloadExt(e.target.value)}
                    className="cursor-pointer appearance-none rounded-2xl border border-[#e2e8f0] bg-slate-50 p-3.5 pr-8 text-sm font-bold focus:border-[#4361ee] focus:outline-none"
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                  </select>
                  <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400">
                    <Layout size={14} />
                  </div>
                </div>
                <button
                  onClick={() => handleDownload()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#4361ee] to-[#3b82f6] px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)]"
                >
                  <Download size={20} />
                  DOWNLOAD {downloadExt.toUpperCase()}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <div className="h-px w-8 bg-slate-200" />
                Live Preview
                <div className="h-px w-8 bg-slate-200" />
              </div>
            </div>

            <div className="mt-6 w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
              <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                <Type size={12} className="text-[#4361ee]" />
                Source Data
              </div>
              <p className="max-w-[250px] truncate text-xs font-medium text-slate-600">
                {url || 'https://example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlToQr;
