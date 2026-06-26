import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Image } from 'lucide-react';
import './ToolCard.css';

const pdfWatermarkAnimation = (
  <div className="tc-scene tc-pdf-watermark-scene flex items-center justify-center">
    <div className="relative h-[50px] w-[58px]">
      <div className="absolute top-1/2 left-1/2 h-[42px] w-[34px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[4px] border border-[#F0997B] bg-[#FFF8F5]">
        <div className="absolute top-[8px] right-[5px] left-[5px] h-[2px] rounded-full bg-[#D85A30] opacity-60" />
        <div className="absolute top-[14px] right-[10px] left-[5px] h-[2px] rounded-full bg-[#D85A30] opacity-35" />

        <div className="absolute inset-0 flex scale-150 rotate-[-25deg] items-center justify-center opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-25">
          <span className="text-[10px] font-black tracking-wider text-[#D85A30]">CONFIDENTIAL</span>
        </div>
      </div>
    </div>
  </div>
);

const urlToQrAnimation = (
  <div className="tc-scene flex items-center justify-center">
    <div className="relative h-[50px] w-[70px]">
      {/* URL Bar */}
      <div className="absolute top-1/2 left-1/2 flex h-[18px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-[#85B7EB] bg-[#E6F1FB] px-[7px] transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-75 group-hover:opacity-0">
        <div className="mr-[5px] h-[4px] w-[4px] rounded-full bg-[#378ADD]" />
        <span className="text-[6px] font-semibold text-[#378ADD]">w w w..</span>
      </div>

      {/* QR Card */}
      <div className="absolute top-1/2 left-1/2 flex h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 scale-75 rotate-6 items-center justify-center rounded-[6px] border border-[#85B7EB] bg-white opacity-0 shadow-sm transition-all duration-500 group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100">
        <svg viewBox="0 0 40 40" width="28" height="28">
          {/* Finder 1 */}
          <rect x="2" y="2" width="10" height="10" rx="1" fill="#378ADD" />
          <rect x="5" y="5" width="4" height="4" fill="white" />

          {/* Finder 2 */}
          <rect x="28" y="2" width="10" height="10" rx="1" fill="#378ADD" />
          <rect x="31" y="5" width="4" height="4" fill="white" />

          {/* Finder 3 */}
          <rect x="2" y="28" width="10" height="10" rx="1" fill="#378ADD" />
          <rect x="5" y="31" width="4" height="4" fill="white" />

          {/* QR Pattern */}
          <rect x="18" y="4" width="3" height="3" fill="#1D9E75" />
          <rect x="22" y="8" width="3" height="3" fill="#1D9E75" />
          <rect x="18" y="12" width="3" height="3" fill="#1D9E75" />
          <rect x="24" y="16" width="3" height="3" fill="#1D9E75" />
          <rect x="16" y="18" width="3" height="3" fill="#1D9E75" />
          <rect x="22" y="22" width="3" height="3" fill="#1D9E75" />
          <rect x="28" y="18" width="3" height="3" fill="#1D9E75" />
          <rect x="18" y="26" width="3" height="3" fill="#1D9E75" />
          <rect x="24" y="30" width="3" height="3" fill="#1D9E75" />
        </svg>

        {/* Success Badge */}
        <div className="absolute -top-[4px] -right-[4px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#1D9E75] text-[8px] font-bold text-white">
          ✓
        </div>
      </div>
    </div>
  </div>
);
const markdownToHtmlAnimation = (
  <div className="tc-scene flex items-center justify-center">
    <div className="relative h-[44px] w-[72px]">
      <div className="absolute top-1/2 left-0 flex h-[38px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[5px] border border-[#7F77DD] bg-[#F6F4FF] transition-all duration-500 ease-out group-hover:-translate-x-3 group-hover:rotate-[-8deg] group-hover:opacity-0">
        <span className="text-[8px] font-bold text-[#534AB7]">MD</span>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:scale-150 group-hover:opacity-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12H19M19 12L13 6M19 12L13 18"
            stroke="#7F77DD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute top-1/2 right-0 flex h-[38px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[5px] border border-[#EF9F27] bg-[#FFF8EC] opacity-80 transition-all duration-500 ease-out group-hover:right-[21px] group-hover:scale-110 group-hover:shadow-md">
        <span className="text-[7px] font-bold text-[#C97200]">HTML</span>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-500 ease-out group-hover:-translate-y-6 group-hover:opacity-100">
        <span className="text-[8px] font-bold text-[#EF9F27]">{'</>'}</span>
      </div>
    </div>
  </div>
);

const imageWatermarkAnimation = (
  <div className="tc-scene tc-image-watermark-scene flex items-center justify-center">
    <div className="relative h-[50px] w-[58px]">
      <div className="absolute top-1/2 left-1/2 h-[36px] w-[36px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[4px] border border-[#85B7EB] bg-[#FAFCFF]">
        <div className="absolute top-[6px] right-[6px] h-[8px] w-[8px] rounded-full bg-[#EF9F27]" />

        <svg viewBox="0 0 36 16" width="36" height="16" className="absolute bottom-0">
          <polygon points="0,16 8,6 15,10 24,3 36,16" fill="#5DCAA5" opacity="0.85" />
        </svg>

        <div className="absolute inset-0 flex translate-y-[8px] items-center justify-center opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-70">
          <span className="rounded bg-[#1D9E75] px-2 py-[1px] text-[8px] font-bold text-white">
            ©Brand
          </span>
        </div>
      </div>
    </div>
  </div>
);

const imageOcrAnimation = (
  <div className="tc-scene tc-image-ocr-scene flex items-center justify-center">
    <div className="relative h-[48px] w-[60px]">
      <div className="absolute inset-0 rounded-[6px] border border-[#85B7EB] bg-[#E6F1FB]" />

      <div className="absolute inset-[8px] rounded-[4px] border border-[#85B7EB] bg-white">
        <div className="absolute top-[5px] right-[5px] h-[8px] w-[8px] rounded-full bg-[#EF9F27]" />
        <div className="absolute top-[10px] right-[18px] left-[6px] h-[2px] rounded-full bg-[#8FB9E8] opacity-70" />
        <div className="absolute top-[15px] right-[22px] left-[6px] h-[2px] rounded-full bg-[#8FB9E8] opacity-50" />
        <div className="absolute top-[20px] right-[14px] left-[6px] h-[2px] rounded-full bg-[#8FB9E8] opacity-35" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
        <div className="rounded border border-[#5DCAA5] bg-white px-1 py-[1px] text-[7px] font-bold text-[#1D9E75]">
          OCR
        </div>
      </div>

      <div className="absolute -top-1 -right-1 scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1D9E75] text-[8px] font-bold text-white">
          ✓
        </div>
      </div>
    </div>
  </div>
);

const pdfSplitAnimation = (
  <div className="tc-scene tc-pdf-split-scene flex items-center justify-center">
    <div className="relative h-[54px] w-[70px]">
      <div className="absolute top-1/2 left-1/2 h-[40px] w-[30px] -translate-x-1/2 -translate-y-1/2 rounded-[4px] border border-[#F0997B] bg-[#FFF8F5] shadow-sm transition-all duration-300 group-hover:opacity-0">
        <div className="absolute top-[8px] right-[5px] left-[5px] h-[2px] rounded-full bg-[#D85A30] opacity-70" />
        <div className="absolute top-[14px] right-[10px] left-[5px] h-[2px] rounded-full bg-[#D85A30] opacity-45" />
        <div className="absolute top-[20px] right-[7px] left-[5px] h-[2px] rounded-full bg-[#D85A30] opacity-30" />
        <span className="absolute bottom-[6px] left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#993C1D]">
          PDF
        </span>
      </div>

      <div className="absolute top-1/2 left-1/2 h-[34px] w-[24px] -translate-x-1/2 -translate-y-1/2 rounded-[4px] border border-[#F0997B] bg-[#FFF8F5] shadow-sm transition-all duration-500 group-hover:-translate-x-[30px]">
        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-bold text-[#993C1D]">
          PDF
        </span>
      </div>

      <div className="absolute top-1/2 left-1/2 h-[34px] w-[24px] -translate-x-1/2 -translate-y-1/2 rounded-[4px] border border-[#F0997B] bg-[#FFF8F5] shadow-sm transition-all duration-500 group-hover:translate-x-[6px]">
        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-bold text-[#993C1D]">
          PDF
        </span>
      </div>
    </div>
  </div>
);

const docToPdfAnimation = (
  <div className="tc-scene tc-docx-pdf-scene flex items-center justify-center">
    <div className="relative h-[52px] w-[70px]">
      {/* DOCX */}
      <div className="absolute top-1/2 left-1/2 flex h-[36px] w-[28px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[4px] border border-[#4F8EF7] bg-[#F5F9FF] text-[7px] font-bold text-[#2563EB] transition-all duration-500 group-hover:-translate-x-[22px] group-hover:scale-75 group-hover:opacity-0">
        DOCX
      </div>

      {/* PDF */}
      <div className="absolute top-1/2 left-1/2 flex h-[36px] w-[28px] translate-x-[30px] -translate-y-1/2 scale-75 items-center justify-center rounded-[4px] border border-[#F0997B] bg-[#FFF8F5] text-[7px] font-bold text-[#D85A30] opacity-0 transition-all duration-500 group-hover:translate-x-[-14px] group-hover:scale-100 group-hover:opacity-100">
        PDF
      </div>

      {/* Check */}
      <div className="absolute top-[6px] right-[8px] flex h-[14px] w-[14px] scale-0 items-center justify-center rounded-full bg-[#1D9E75] text-[8px] font-bold text-white opacity-0 transition-all delay-300 duration-300 group-hover:scale-100 group-hover:opacity-100">
        ✓
      </div>
    </div>
  </div>
);

const imageToSvgAnimation = (
  <div className="tc-scene tc-image-svg-scene flex items-center justify-center">
    <div className="relative h-[40px] w-[40px]">
      {/* IMAGE */}
      <div className="absolute inset-0 overflow-hidden rounded-[6px] border border-[#85B7EB] bg-[#E6F1FB] transition-all duration-500 group-hover:scale-75 group-hover:rotate-6 group-hover:opacity-0">
        <div className="absolute top-[6px] right-[6px] h-[7px] w-[7px] rounded-full bg-[#EF9F27]" />

        <svg viewBox="0 0 40 16" width="40" height="16" className="absolute bottom-0">
          <polygon points="0,16 10,4 18,9 28,2 40,16" fill="#5DCAA5" opacity="0.85" />
        </svg>
      </div>

      {/* SVG */}
      <div className="absolute inset-0 flex scale-125 items-center justify-center rounded-[6px] border border-[#378ADD] bg-white opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <polygon points="5,17 8,7 16,9 19,15" fill="none" stroke="#378ADD" strokeWidth="1.6" />

          <circle cx="5" cy="17" r="1.8" fill="#378ADD" />
          <circle cx="8" cy="7" r="1.8" fill="#378ADD" />
          <circle cx="16" cy="9" r="1.8" fill="#378ADD" />
          <circle cx="19" cy="15" r="1.8" fill="#378ADD" />
        </svg>

        <span className="absolute top-[3px] text-[6px] font-bold text-[#378ADD]">SVG</span>
      </div>
    </div>
  </div>
);

const toolAnimations = {
  'pdf-to-png': (
    <div className="tc-scene tc-pdf-png-scene flex items-center gap-[7px]">
      <div className="tc-pdf-side">
        <div className="tc-doc tc-doc--pdf relative flex h-[44px] w-[34px] shrink-0 flex-col items-center justify-end rounded-[4px] border border-[#F0997B] bg-[#FAECE7] pb-[7px]">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold tracking-[0.4px] text-[#993C1D]">
            PDF
          </span>
        </div>
      </div>
      <div className="tc-arrow shrink-0 text-[20px] text-[#D85A30] opacity-40">›</div>
      <div className="tc-png-side">
        <div className="tc-doc tc-doc--png relative flex h-[44px] w-[34px] shrink-0 flex-col items-center justify-end rounded-[4px] border border-[#5DCAA5] bg-[#E1F5EE] pb-[7px]">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold tracking-[0.4px] text-[#085041]">
            PNG
          </span>
          <div
            className="tc-pixel-grid absolute bottom-[5px] grid grid-cols-4 gap-[1px] opacity-0"
            style={{ gridTemplateColumns: 'repeat(4, 5px)' }}
          >
            {[
              '#378ADD',
              '#1D9E75',
              '#EF9F27',
              '#378ADD',
              '#1D9E75',
              '#EF9F27',
              '#378ADD',
              '#1D9E75',
              '#EF9F27',
              '#378ADD',
              '#1D9E75',
              '#EF9F27',
            ].map((c, i) => (
              <div
                key={i}
                className="tc-pixel h-[5px] w-[5px] rounded-[0.5px]"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  'image-to-pdf': (
    <div className="tc-scene tc-img-pdf-scene flex items-center gap-[4px]">
      <div className="tc-img-side">
        <div className="tc-photo-frame relative h-[34px] w-[40px] shrink-0 overflow-hidden rounded-[5px] border border-[#85B7EB] bg-[#E6F1FB]">
          <div className="tc-photo-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-photo-sun absolute top-[5px] right-[6px] h-[9px] w-[9px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-photo-hills absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,16 10,4 18,9 28,2 40,16" fill="#5DCAA5" opacity="0.8" />
          </svg>
        </div>
      </div>
      <div className="tc-arrow mx-[6px] shrink-0 text-[20px] text-[#999] opacity-50">›</div>
      <div className="tc-pdf-out-side">
        <div className="tc-doc tc-doc--pdf relative flex h-[44px] w-[34px] shrink-0 flex-col items-center justify-end rounded-[4px] border border-[#F0997B] bg-[#FAECE7] pb-[7px]">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold tracking-[0.4px] text-[#993C1D]">
            PDF
          </span>
          <div className="tc-pdf-lines absolute right-[5px] bottom-[7px] left-[5px]">
            <div className="tc-pdf-line mb-[2.5px] h-[1.5px] w-[80%] rounded-[1px] bg-[#F0997B] opacity-60" />
            <div className="tc-pdf-line mb-[2.5px] h-[1.5px] w-[60%] rounded-[1px] bg-[#F0997B] opacity-60" />
            <div className="tc-pdf-line mb-[2.5px] h-[1.5px] w-[72%] rounded-[1px] bg-[#F0997B] opacity-60" />
          </div>
        </div>
      </div>
    </div>
  ),

  'pdf-merge': (
    <div className="tc-scene tc-merge-scene flex items-center gap-[6px]">
      <div className="tc-merge-stack relative h-[50px] w-[38px] shrink-0">
        <div className="tc-doc tc-doc--merge tc-doc--merge-1 absolute top-0 left-[8px] z-[3] h-[40px] w-[30px] rounded-[4px] border border-[#F0997B] bg-[#FAECE7]">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-bold text-[#993C1D]">
            PDF
          </span>
        </div>
        <div className="tc-doc tc-doc--merge tc-doc--merge-2 absolute top-[4px] left-[4px] z-[2] h-[40px] w-[30px] rounded-[4px] border border-[#F0997B] bg-[#FAECE7] opacity-70">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-bold text-[#993C1D]">
            PDF
          </span>
        </div>
        <div className="tc-doc tc-doc--merge tc-doc--merge-3 absolute top-[8px] left-0 z-[1] h-[40px] w-[30px] rounded-[4px] border border-[#F0997B] bg-[#FAECE7] opacity-40">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-bold text-[#993C1D]">
            PDF
          </span>
        </div>
      </div>
      <div className="tc-arrow mx-[6px] shrink-0 text-[20px] text-[#999] opacity-50">›</div>
      <div className="tc-doc tc-doc--merged relative flex h-[44px] w-[34px] flex-col items-center justify-end rounded-[4px] border border-[#F0997B] bg-[#FAECE7] pb-[7px]">
        <span className="tc-doc__tag absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-[#993C1D]">
          PDF
        </span>
        <div className="tc-merge-lines absolute right-[5px] bottom-[6px] left-[5px]">
          <div className="tc-merge-line tc-merge-line--1 mb-[3px] h-[1.5px] w-[80%] rounded-[1px] bg-[#F0997B] opacity-0" />
          <div className="tc-merge-line tc-merge-line--2 mb-[3px] h-[1.5px] w-[55%] rounded-[1px] bg-[#F0997B] opacity-0" />
          <div className="tc-merge-line tc-merge-line--3 mb-[3px] h-[1.5px] w-[68%] rounded-[1px] bg-[#F0997B] opacity-0" />
        </div>
      </div>
    </div>
  ),

  'pdf-sign': (
    <div className="tc-scene tc-sign-scene">
      <div className="tc-sign-doc relative flex h-[62px] w-[52px] flex-col gap-[4px] rounded-[5px] border border-[#AFA9EC] bg-[#EEEDFE] px-[6px] pt-[10px] pb-[6px]">
        <div className="tc-sign-lines flex flex-col gap-[3px]">
          <div className="tc-sign-line h-[2px] w-full rounded-[1px] bg-[#AFA9EC] opacity-50" />
          <div className="tc-sign-line h-[2px] w-[75%] rounded-[1px] bg-[#AFA9EC] opacity-50" />
          <div className="tc-sign-line h-[2px] w-[88%] rounded-[1px] bg-[#AFA9EC] opacity-50" />
        </div>
        <div className="tc-sign-area mt-[2px] flex h-[28px] items-center justify-center border-t border-dashed border-[#AFA9EC] pt-[2px]">
          <svg className="tc-signature" viewBox="0 0 60 24" width="60" height="24">
            <path
              className="tc-sig-path"
              d="M4,18 C10,6 16,20 22,12 C28,4 32,20 38,14 C44,8 50,18 56,10"
              fill="none"
              stroke="#534AB7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="tc-sign-badge absolute -bottom-[10px] left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap text-[#1D9E75] opacity-0">
          ✓ Signed
        </div>
      </div>
    </div>
  ),

  'image-compress': (
    <div className="tc-scene tc-compress-scene">
      <div className="tc-compress-wrap flex flex-col items-center gap-[6px]">
        <div className="tc-compress-photo relative h-[40px] w-[54px] overflow-hidden rounded-[6px] border border-[#85B7EB] bg-[#E6F1FB]">
          <div className="tc-compress-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-compress-sun absolute top-[6px] right-[8px] h-[10px] w-[10px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 44 18"
            width="44"
            height="18"
            className="tc-compress-hills absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,18 11,5 20,10 30,2 44,18" fill="#5DCAA5" opacity="0.7" />
          </svg>
        </div>
        <div className="tc-compress-bar-wrap w-[54px]">
          <div className="tc-compress-bar-bg h-[5px] overflow-hidden rounded-[3px] bg-[#e0e0e0]">
            <div
              className="tc-compress-bar-fill h-full w-full rounded-[3px]"
              style={{
                background: 'linear-gradient(90deg, #1D9E75, #5DCAA5)',
                transformOrigin: 'left center',
              }}
            />
          </div>
          <div className="tc-compress-labels mt-[3px] flex justify-between">
            <span className="tc-compress-before text-[8px] text-[#993556] opacity-100">4.2 MB</span>
            <span className="tc-compress-after text-[8px] text-[#1D9E75] opacity-0">1.1 MB</span>
          </div>
        </div>
      </div>
    </div>
  ),

  'image-upscale': (
    <div className="tc-scene tc-upscale-scene">
      <div className="tc-upscale-wrap relative flex items-end gap-[5px]">
        <div className="tc-upscale-frame tc-upscale-frame--small relative h-[22px] w-[28px] shrink-0 overflow-hidden rounded-[5px] border border-[#85B7EB] bg-[#E6F1FB]">
          <div className="tc-upscale-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-upscale-sun absolute top-[4px] right-[5px] h-[7px] w-[7px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg viewBox="0 0 24 10" width="24" height="10">
            <polygon points="0,10 6,3 11,6 16,1 24,10" fill="#5DCAA5" opacity="0.8" />
          </svg>
        </div>
        <div className="tc-upscale-arrow mb-[4px] text-[16px] font-bold text-[#7F77DD]">↗</div>
        <div className="tc-upscale-frame tc-upscale-frame--big relative h-[36px] w-[44px] shrink-0 overflow-hidden rounded-[5px] border border-[#85B7EB] bg-[#E6F1FB]">
          <div className="tc-upscale-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-upscale-sun absolute top-[4px] right-[5px] h-[7px] w-[7px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg viewBox="0 0 40 16" width="40" height="16">
            <polygon points="0,16 10,4 18,9 28,2 40,16" fill="#5DCAA5" opacity="0.8" />
          </svg>
        </div>
        <div className="tc-upscale-badge absolute -top-[8px] -right-[6px] rounded-[4px] bg-[#7F77DD] px-[5px] py-[2px] text-[8px] font-bold text-white opacity-0">
          HD
        </div>
      </div>
    </div>
  ),

  'image-to-webp': (
    <div className="tc-scene tc-webp-scene">
      <div className="tc-webp-wrap flex items-center gap-[5px]">
        <div className="tc-webp-photo relative h-[34px] w-[40px] shrink-0 overflow-hidden rounded-[5px] border border-[#85B7EB] bg-[#E6F1FB]">
          <div className="tc-webp-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-webp-sun absolute top-[5px] right-[6px] h-[9px] w-[9px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-webp-hills absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,16 10,4 18,9 28,2 40,16" fill="#5DCAA5" opacity="0.8" />
          </svg>
        </div>
        <div className="tc-arrow mx-[6px] shrink-0 text-[20px] text-[#999] opacity-50">›</div>
        <div className="tc-webp-badge-wrap">
          <div className="tc-webp-doc relative flex h-[44px] w-[34px] items-center justify-center rounded-[4px] border border-[#5DCAA5] bg-[#E1F5EE]">
            <span className="tc-webp-tag text-[8px] font-bold tracking-[0.3px] text-[#085041]">
              WebP
            </span>
          </div>
        </div>
      </div>
    </div>
  ),

  'image-to-jpg': (
    <div className="tc-scene tc-jpg-scene">
      <div className="tc-jpg-wrap relative flex items-center justify-center">
        <div className="tc-jpg-stack relative h-[50px] w-[56px]">
          <div className="tc-jpg-frame tc-jpg-frame--back absolute top-[6px] left-[8px] h-[42px] w-[48px] overflow-hidden rounded-[6px] border border-[#EF9F27] bg-[#FAEEDA] opacity-50">
            <div className="tc-jpg-sky absolute inset-0 bg-[#FAEEDA]" />
            <div className="tc-jpg-sun absolute top-[7px] right-[8px] h-[10px] w-[10px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          </div>
          <div className="tc-jpg-frame tc-jpg-frame--front absolute top-0 left-0 z-[1] h-[42px] w-[48px] overflow-hidden rounded-[6px] border border-[#EF9F27] bg-[#FAEEDA]">
            <div className="tc-jpg-sky absolute inset-0 bg-[#FAEEDA]" />
            <div
              className="tc-jpg-sun absolute rounded-full border border-[#BA7517] bg-[#EF9F27]"
              style={{ right: 6, top: 5, width: 9, height: 9 }}
            />
            <svg
              viewBox="0 0 48 18"
              width="48"
              height="18"
              className="tc-jpg-hills absolute right-0 bottom-0 left-0"
            >
              <polygon points="0,18 10,5 20,10 32,2 48,18" fill="#D85A30" opacity="0.7" />
            </svg>
          </div>
        </div>
        <div className="tc-jpg-badge absolute -bottom-[6px] left-1/2 -translate-x-1/2 rounded-[3px] border border-[#EF9F27] bg-[#FAEEDA] px-[6px] py-[2px] text-[9px] font-bold whitespace-nowrap text-[#633806] opacity-0">
          JPG
        </div>
      </div>
    </div>
  ),

  'image-to-grayscale': (
    <div className="tc-scene tc-grayscale-scene">
      <div className="tc-grayscale-wrap flex items-center gap-[6px]">
        <div className="tc-grayscale-photo tc-grayscale-photo--color relative h-[34px] w-[40px] shrink-0 overflow-hidden rounded-[5px] border border-[#85B7EB]">
          <div className="tc-gs-sky tc-gs-sky--color absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-gs-sun absolute top-[5px] right-[6px] h-[9px] w-[9px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-gs-hills tc-gs-hills--color absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,16 10,4 18,9 28,2 40,16" fill="#5DCAA5" opacity="0.8" />
          </svg>
        </div>
        <div className="tc-arrow mx-[6px] shrink-0 text-[20px] text-[#999] opacity-50">›</div>
        <div className="tc-grayscale-photo tc-grayscale-photo--gray relative h-[34px] w-[40px] shrink-0 overflow-hidden rounded-[5px] border border-[#aaa]">
          <div className="tc-gs-sky tc-gs-sky--gray absolute inset-0 bg-[#e0e0e0]" />
          <div className="tc-gs-sun tc-gs-sun--gray absolute top-[5px] right-[6px] h-[9px] w-[9px] rounded-full border border-[#888] bg-[#aaa]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-gs-hills tc-gs-hills--gray absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,16 10,4 18,9 28,2 40,16" fill="#888" opacity="0.8" />
          </svg>
        </div>
      </div>
    </div>
  ),

  'remove-bg': (
    <div className="tc-scene tc-removebg-scene">
      <div className="tc-removebg-wrap relative h-[62px] w-[52px]">
        <div
          className="tc-rb-checker absolute inset-0 rounded-[6px] opacity-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
            backgroundColor: '#fff',
          }}
        />
        <div className="tc-rb-bg absolute inset-0 rounded-[6px] border border-[#85B7EB] bg-[#E6F1FB]" />
        <div className="tc-rb-person absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[3px]">
          <div className="tc-rb-head h-[16px] w-[16px] rounded-full border border-[#7F77DD] bg-[#EEEDFE]" />
          <div className="tc-rb-torso h-[24px] w-[26px] rounded-t-[5px] border border-[#7F77DD] bg-[#EEEDFE]" />
        </div>
        <div className="tc-rb-check absolute -top-[5px] -right-[6px] z-[2] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1D9E75] text-[10px] font-bold text-white opacity-0">
          ✓
        </div>
      </div>
    </div>
  ),
  'pdf-rotate-flip': (
    <div className="tc-scene group flex items-center justify-center">
      <div className="relative flex h-[54px] w-[70px] items-center justify-center">
        <div className="relative h-[34px] w-[24px] rounded-[4px] border border-[#F0997B] bg-[#FFF8F5] shadow-sm transition-all duration-500 ease-out group-hover:scale-110 group-hover:scale-x-[-1]">
          <div className="absolute inset-0 transition-all duration-500 group-hover:scale-x-[-1]">
            <div className="absolute top-[7px] right-[4px] left-[4px] h-[1.5px] rounded-full bg-[#D85A30] opacity-70" />
            <div className="absolute top-[13px] right-[8px] left-[4px] h-[1.5px] rounded-full bg-[#D85A30] opacity-45" />
            <div className="absolute top-[19px] right-[6px] left-[4px] h-[1.5px] rounded-full bg-[#D85A30] opacity-30" />

            <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 text-[6px] font-bold text-[#D85A30]">
              PDF
            </span>
          </div>
        </div>
      </div>
    </div>
  ),

  'rotate-flip': (
    <div className="tc-scene tc-rotate-scene">
      <div className="tc-rotate-wrap relative flex items-center justify-center">
        <div className="tc-rot-frame relative h-[50px] w-[50px] overflow-hidden rounded-[6px] border border-[#EF9F27] bg-[#FAEEDA]">
          <div className="tc-rot-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-rot-sun absolute top-[7px] right-[8px] h-[10px] w-[10px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 48 18"
            width="48"
            height="18"
            className="tc-rot-hills absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,18 11,5 20,11 30,2 48,18" fill="#EF9F27" opacity="0.7" />
          </svg>
        </div>
        <div className="tc-rot-arrow absolute -right-[6px] -bottom-[4px] text-[20px] font-bold text-[#EF9F27] opacity-0">
          ↻
        </div>
      </div>
    </div>
  ),

  'image-resize': (
    <div className="tc-scene tc-resize-scene">
      <div className="tc-resize-wrap relative flex items-end gap-[5px]">
        <div className="tc-resize-frame tc-resize-frame--big relative h-[40px] w-[48px] shrink-0 overflow-hidden rounded-[5px] border border-[#5DCAA5] bg-[#E1F5EE]">
          <div className="tc-resize-sky absolute inset-0 bg-[#E1F5EE]" />
          <div className="tc-resize-sun absolute top-[5px] right-[5px] h-[8px] w-[8px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 48 18"
            width="48"
            height="18"
            className="tc-resize-hills absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,18 11,5 20,11 30,2 48,18" fill="#5DCAA5" opacity="0.7" />
          </svg>
        </div>
        <div className="tc-resize-frame tc-resize-frame--small relative h-[24px] w-[28px] shrink-0 overflow-hidden rounded-[5px] border border-[#5DCAA5] bg-[#E1F5EE]">
          <div className="tc-resize-sky absolute inset-0 bg-[#E1F5EE]" />
          <div className="tc-resize-sun absolute top-[5px] right-[5px] h-[8px] w-[8px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 28 10"
            width="28"
            height="10"
            className="tc-resize-hills absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,10 6,3 11,6 16,1 28,10" fill="#5DCAA5" opacity="0.7" />
          </svg>
        </div>
        <div className="tc-resize-badge absolute -top-[8px] left-1/2 -translate-x-1/2 text-[14px] font-bold text-[#1D9E75] opacity-0">
          ↔
        </div>
      </div>
    </div>
  ),

  'image-dpi': (
    <div className="tc-scene tc-dpi-scene">
      <div className="tc-dpi-wrap relative flex items-center gap-[6px]">
        <div className="tc-dpi-frame flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[6px] border border-[#97C459] bg-[#EAF3DE]">
          <div
            className="tc-dpi-dots grid gap-[2px]"
            style={{ gridTemplateColumns: 'repeat(3, 8px)' }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="tc-dpi-dot tc-dpi-dot--low h-[8px] w-[8px] rounded-full bg-[#639922] opacity-50"
              />
            ))}
          </div>
        </div>
        <div className="tc-arrow mx-[6px] shrink-0 text-[20px] text-[#999] opacity-50">›</div>
        <div className="tc-dpi-frame flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[6px] border border-[#97C459] bg-[#EAF3DE]">
          <div
            className="tc-dpi-dots grid gap-[2px]"
            style={{ gridTemplateColumns: 'repeat(5, 4px)' }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="tc-dpi-dot tc-dpi-dot--high h-[4px] w-[4px] rounded-full bg-[#639922] opacity-70"
              />
            ))}
          </div>
        </div>
        <div className="tc-dpi-label absolute -bottom-[14px] left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap text-[#3B6D11] opacity-50">
          72 → 300 DPI
        </div>
      </div>
    </div>
  ),

  'image-metadata': (
    <div className="tc-scene tc-metadata-scene">
      <div className="tc-meta-shell relative h-[62px] w-[52px] overflow-hidden rounded-[5px] border border-[#AFA9EC] bg-[#EEEDFE] px-[6px] pt-[12px] pb-[6px]">
        <div className="tc-meta-rows flex flex-col gap-[5px]">
          {[100, 60, 80, 50, 70].map((w, i) => (
            <div key={i} className="tc-meta-row flex items-center gap-[3px]">
              <div className="tc-meta-key h-[2px] w-[10px] shrink-0 rounded-[1px] bg-[#7F77DD]" />
              <div
                className="tc-meta-val h-[2px] rounded-[1px] bg-[#AFA9EC] opacity-60"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
        </div>
        <div
          className="tc-meta-scanner absolute right-0 left-0 h-[2px] bg-[#534AB7] opacity-0"
          style={{ top: 10, boxShadow: '0 0 6px #534AB7' }}
        />
      </div>
    </div>
  ),

  'image-to-base64': (
    <div className="tc-scene tc-base64-scene">
      <div className="tc-b64-wrap flex items-center gap-[6px]">
        <div className="tc-b64-photo relative h-[34px] w-[38px] shrink-0 overflow-hidden rounded-[5px] border border-[#85B7EB] bg-[#E6F1FB]">
          <div className="tc-b64-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-b64-sun absolute top-[5px] right-[5px] h-[8px] w-[8px] rounded-full border border-[#BA7517] bg-[#EF9F27]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-b64-hills absolute right-0 bottom-0 left-0"
          >
            <polygon points="0,16 10,4 18,9 28,2 40,16" fill="#5DCAA5" opacity="0.8" />
          </svg>
        </div>
        <div className="tc-arrow mx-[6px] shrink-0 text-[20px] text-[#999] opacity-50">›</div>
        <div className="tc-b64-code relative flex h-[48px] w-[44px] flex-col gap-[4px] overflow-hidden rounded-[5px] border border-[#444] bg-[#1E1E2E] p-[6px_5px]">
          <div className="tc-b64-line h-[2px] w-[90%] rounded-[1px] bg-[#5DCAA5] opacity-70" />
          <div className="tc-b64-line h-[2px] w-[70%] rounded-[1px] bg-[#5DCAA5] opacity-70" />
          <div className="tc-b64-line h-[2px] w-[85%] rounded-[1px] bg-[#5DCAA5] opacity-70" />
          <div className="tc-b64-line h-[2px] w-[55%] rounded-[1px] bg-[#5DCAA5] opacity-70" />
          <div className="tc-b64-cursor absolute right-[6px] bottom-[6px] h-[8px] w-[2px] rounded-[1px] bg-[#5DCAA5] opacity-0" />
        </div>
      </div>
    </div>
  ),

  'md-to-html': markdownToHtmlAnimation,

  'image-ocr': imageOcrAnimation,

  'docx-to-pdf': docToPdfAnimation,

  'image-to-svg': imageToSvgAnimation,

  'pdf-split': pdfSplitAnimation,

  'pdf-watermark': pdfWatermarkAnimation,

  'image-watermark': imageWatermarkAnimation,

  'url-to-qr': urlToQrAnimation,

  'image-blur': (
    <div className="tc-scene tc-blur-scene flex items-center justify-center">
      <div className="tc-blur-image flex h-[40px] w-[54px] items-center justify-center rounded-[8px] border border-[#85B7EB] bg-[#E6F1FB]">
        <Image />
      </div>
    </div>
  ),
};

const ToolCard = ({ tool, index }) => (
  <Link
    to={tool.path}
    className="group animate-fade-in-up relative flex h-full min-h-50 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl md:min-h-60 md:p-8 dark:border-gray-700 dark:bg-gray-800"
    style={{ animationDelay: `${1000 + index * 100}ms` }}
  >
    <div
      className={`absolute inset-0 rounded-2xl bg-linear-to-br ${tool.gradient} -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
    />
    <div className="relative mb-6 flex h-20 w-full items-center justify-center">
      {toolAnimations[tool.id] ?? (
        <div
          className={`h-14 w-14 rounded-xl bg-linear-to-br ${tool.iconGradient} tc-icon-float p-px`}
        >
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-white">
            {React.cloneElement(tool.icon, {
              className: 'w-7 h-7 text-slate-800',
            })}
          </div>
        </div>
      )}
    </div>

    <h3 className="mx-auto mb-1 line-clamp-2 max-w-30 text-center text-base leading-tight font-bold text-slate-900 transition-all duration-300 group-hover:bg-linear-to-r group-hover:from-slate-900 group-hover:to-blue-700 group-hover:bg-clip-text group-hover:text-transparent md:mx-0 md:mb-3 md:text-left md:text-xl dark:text-white">
      {tool.name}
    </h3>
    <p className="flex-1 text-center text-xs leading-relaxed text-slate-600 md:text-left md:text-sm dark:text-slate-400">
      {tool.description}
    </p>

    <div className="absolute right-8 bottom-8 translate-x-2 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
      <ArrowRight className="h-6 w-6 text-blue-600" />
    </div>
  </Link>
);

export default ToolCard;
