import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Image } from "lucide-react";
import "../../styles/ToolCard.css";

const pdfWatermarkAnimation = (
  <div className="tc-scene tc-pdf-watermark-scene flex items-center justify-center">
    <div className="relative w-14.5 h-12.5">
      <div className="absolute left-1/2 top-1/2 w-8.5 h-10.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#FFF8F5] border border-[#F0997B] overflow-hidden">
        <div className="absolute top-2 left-1.25 right-1.25 h-0.5 rounded-full bg-[#D85A30] opacity-60" />
        <div className="absolute top-3.5 left-1.25 right-2.5 h-0.5 rounded-full bg-[#D85A30] opacity-35" />

        <div className="absolute inset-0 flex items-center justify-center rotate-[-25deg] opacity-0 scale-150 group-hover:opacity-25 group-hover:scale-100 transition-all duration-500">
          <span className="text-[10px] font-black tracking-wider text-[#D85A30]">
            CONFIDENTIAL
          </span>
        </div>
      </div>
    </div>
  </div>
);

const urlToQrAnimation = (
  <div className="tc-scene flex items-center justify-center">
    <div className="relative w-17.5 h-12.5">

      {/* URL Bar */}
      <div
        className="
          absolute left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          w-13 h-4.5
          rounded-full
          bg-[#E6F1FB]
          border border-[#85B7EB]
          flex items-center px-1.75
          transition-all duration-500
          group-hover:opacity-0
          group-hover:scale-75
          group-hover:-translate-y-2
        "
      >
        <div className="w-1 h-1 rounded-full bg-[#378ADD] mr-1.25" />
        <span className="text-[6px] font-semibold text-[#378ADD]">
          w w w..
        </span>
      </div>

      {/* QR Card */}
      <div
        className="
          absolute left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          w-10.5 h-10.5
          rounded-md
          bg-white
          border border-[#85B7EB]
          shadow-sm
          flex items-center justify-center
          opacity-0
          scale-75
          rotate-6
          transition-all duration-500
          group-hover:opacity-100
          group-hover:scale-100
          group-hover:rotate-0
        "
      >
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
        <div
          className="
            absolute -top-1 -right-1
            w-3.5 h-3.5
            rounded-full
            bg-[#1D9E75]
            text-white
            text-[8px]
            flex items-center justify-center
            font-bold
          "
        >
          ✓
        </div>
      </div>
    </div>
  </div>
);
const markdownToHtmlAnimation = (
  <div className="tc-scene flex items-center justify-center">
    <div className="relative w-18 h-11">
      <div
        className="
          absolute left-0 top-1/2 -translate-y-1/2
          w-7.5 h-9.5
          rounded-[5px]
          border border-[#7F77DD]
          bg-[#F6F4FF]
          flex items-center justify-center
          transition-all duration-500 ease-out
          group-hover:-translate-x-3
          group-hover:rotate-[-8deg]
          group-hover:opacity-0
        "
      >
        <span className="text-[8px] font-bold text-[#534AB7]">
          MD
        </span>
      </div>
      <div
        className="
          absolute left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          transition-all duration-500
          group-hover:opacity-0
          group-hover:scale-150
        "
      >
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
      <div
        className="
          absolute right-0 top-1/2 -translate-y-1/2
          w-7.5 h-9.5
          rounded-[5px]
          border border-[#EF9F27]
          bg-[#FFF8EC]
          flex items-center justify-center
          opacity-80
          transition-all duration-500 ease-out
          group-hover:right-5.25
          group-hover:scale-110
          group-hover:shadow-md
        "
      >
        <span className="text-[7px] font-bold text-[#C97200]">
          HTML
        </span>
      </div>
      <div
        className="
          absolute left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          opacity-0
          transition-all duration-500 ease-out
          group-hover:opacity-100
          group-hover:-translate-y-6
        "
      >
        <span className="text-[8px] font-bold text-[#EF9F27]">
          {"</>"}
        </span>
      </div>
    </div>
  </div>
);

const imageWatermarkAnimation = (
  <div className="tc-scene tc-image-watermark-scene flex items-center justify-center">
    <div className="relative w-14.5 h-12.5">
      <div className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#FAFCFF] border border-[#85B7EB] overflow-hidden">
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF9F27]" />

        <svg
          viewBox="0 0 36 16"
          width="36"
          height="16"
          className="absolute bottom-0"
        >
          <polygon
            points="0,16 8,6 15,10 24,3 36,16"
            fill="#5DCAA5"
            opacity="0.85"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-70 group-hover:translate-y-0 transition-all duration-500">
          <span className="text-[8px] font-bold text-white bg-[#1D9E75] px-2 py-px rounded">
            ©Brand
          </span>
        </div>
      </div>
    </div>
  </div>
);

const imageOcrAnimation = (
  <div className="tc-scene tc-image-ocr-scene flex items-center justify-center">
    <div className="relative w-15 h-12">
      <div className="absolute inset-0 rounded-md bg-[#E6F1FB] border border-[#85B7EB]" />

      <div className="absolute inset-2 rounded-sm bg-white border border-[#85B7EB]">
        <div className="absolute top-1.25 right-1.25 w-2 h-2 rounded-full bg-[#EF9F27]" />
        <div className="absolute left-1.5 right-4.5 top-2.5 h-0.5 rounded-full bg-[#8FB9E8] opacity-70" />
        <div className="absolute left-1.5 right-5.5 top-3.75 h-0.5 rounded-full bg-[#8FB9E8] opacity-50" />
        <div className="absolute left-1.5 right-3.5 top-5 h-0.5 rounded-full bg-[#8FB9E8] opacity-35" />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
        <div className="bg-white border border-[#5DCAA5] rounded px-1 py-px text-[7px] font-bold text-[#1D9E75]">
          OCR
        </div>
      </div>

      <div className="absolute -top-1 -right-1 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
        <div className="w-4 h-4 rounded-full bg-[#1D9E75] text-white text-[8px] flex items-center justify-center font-bold">
          ✓
        </div>
      </div>
    </div>
  </div>
);

const pdfSplitAnimation = (
  <div className="tc-scene tc-pdf-split-scene flex items-center justify-center">
    <div className="relative w-17.5 h-13.5">
      <div className="absolute left-1/2 top-1/2 w-7.5 h-10 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#FFF8F5] border border-[#F0997B] shadow-sm group-hover:opacity-0 transition-all duration-300">
        <div className="absolute top-2 left-1.25 right-1.25 h-0.5 rounded-full bg-[#D85A30] opacity-70" />
        <div className="absolute top-3.5 left-1.25 right-2.5 h-0.5 rounded-full bg-[#D85A30] opacity-45" />
        <div className="absolute top-5 left-1.25 right-1.75 h-0.5 rounded-full bg-[#D85A30] opacity-30" />
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#993C1D]">
          PDF
        </span>
      </div>

      <div className="absolute left-1/2 top-1/2 w-6 h-8.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#FFF8F5] border border-[#F0997B] shadow-sm group-hover:-translate-x-7.5 transition-all duration-500">
        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-bold text-[#993C1D]">
          PDF
        </span>
      </div>

      <div className="absolute left-1/2 top-1/2 w-6 h-8.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#FFF8F5] border border-[#F0997B] shadow-sm group-hover:translate-x-1.5 transition-all duration-500">
        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-bold text-[#993C1D]">
          PDF
        </span>
      </div>
    </div>
  </div>
);

const docToPdfAnimation = (
  <div className="tc-scene tc-docx-pdf-scene flex items-center justify-center">
    <div className="relative w-17.5 h-13">
      {/* DOCX */}
      <div className="absolute left-1/2 top-1/2 w-7 h-9 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-[#4F8EF7] bg-[#F5F9FF] flex items-center justify-center text-[7px] font-bold text-[#2563EB] transition-all duration-500 group-hover:-translate-x-5.5 group-hover:opacity-0 group-hover:scale-75">
        DOCX
      </div>

      {/* PDF */}
      <div className="absolute left-1/2 top-1/2 w-7 h-9 -translate-y-1/2 translate-x-7.5 rounded-sm border border-[#F0997B] bg-[#FFF8F5] flex items-center justify-center text-[7px] font-bold text-[#D85A30] opacity-0 scale-75 transition-all duration-500 group-hover:-translate-x-3.5 group-hover:opacity-100 group-hover:scale-100">
        PDF
      </div>

      {/* Check */}
      <div className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full bg-[#1D9E75] text-white text-[8px] flex items-center justify-center font-bold opacity-0 scale-0 transition-all duration-300 delay-300 group-hover:opacity-100 group-hover:scale-100">
        ✓
      </div>
    </div>
  </div>
);

const imageToSvgAnimation = (
  <div className="tc-scene tc-image-svg-scene flex items-center justify-center">
    <div className="relative w-10 h-10">
      {/* IMAGE */}
      <div
        className="
          absolute inset-0
          rounded-md
          bg-[#E6F1FB]
          border border-[#85B7EB]
          overflow-hidden
          transition-all duration-500
          group-hover:opacity-0
          group-hover:scale-75
          group-hover:rotate-6
        "
      >
        <div className="absolute top-1.5 right-1.5 w-1.75 h-1.75 rounded-full bg-[#EF9F27]" />

        <svg
          viewBox="0 0 40 16"
          width="40"
          height="16"
          className="absolute bottom-0"
        >
          <polygon
            points="0,16 10,4 18,9 28,2 40,16"
            fill="#5DCAA5"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* SVG */}
      <div
        className="
          absolute inset-0
          rounded-md
          bg-white
          border border-[#378ADD]
          flex items-center justify-center
          opacity-0
          scale-125
          transition-all duration-500
          group-hover:opacity-100
          group-hover:scale-100
        "
      >
        <svg viewBox="0 0 24 24" width="22" height="22">
          <polygon
            points="5,17 8,7 16,9 19,15"
            fill="none"
            stroke="#378ADD"
            strokeWidth="1.6"
          />

          <circle cx="5" cy="17" r="1.8" fill="#378ADD" />
          <circle cx="8" cy="7" r="1.8" fill="#378ADD" />
          <circle cx="16" cy="9" r="1.8" fill="#378ADD" />
          <circle cx="19" cy="15" r="1.8" fill="#378ADD" />
        </svg>

        <span className="absolute top-0.75 text-[6px] font-bold text-[#378ADD]">
          SVG
        </span>
      </div>
    </div>
  </div>
);

const toolAnimations = {
  "pdf-to-png": (
    <div className="tc-scene tc-pdf-png-scene flex items-center gap-1.75">
      <div className="tc-pdf-side">
        <div className="tc-doc tc-doc--pdf w-8.5 h-11 rounded-sm relative flex flex-col items-center justify-end pb-1.75 shrink-0 bg-[#FAECE7] border border-[#F0997B]">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold tracking-[0.4px] text-[#993C1D]">
            PDF
          </span>
        </div>
      </div>
      <div className="tc-arrow text-[20px] text-[#D85A30] shrink-0 opacity-40">
        ›
      </div>
      <div className="tc-png-side">
        <div className="tc-doc tc-doc--png w-8.5 h-11 rounded-sm relative flex flex-col items-center justify-end pb-1.75 shrink-0 bg-[#E1F5EE] border border-[#5DCAA5]">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold tracking-[0.4px] text-[#085041]">
            PNG
          </span>
          <div
            className="tc-pixel-grid grid grid-cols-4 gap-px absolute bottom-1.25 opacity-0"
            style={{ gridTemplateColumns: "repeat(4, 5px)" }}
          >
            {[
              "#378ADD",
              "#1D9E75",
              "#EF9F27",
              "#378ADD",
              "#1D9E75",
              "#EF9F27",
              "#378ADD",
              "#1D9E75",
              "#EF9F27",
              "#378ADD",
              "#1D9E75",
              "#EF9F27",
            ].map((c, i) => (
              <div
                key={i}
                className="tc-pixel w-1.25 h-1.25 rounded-[0.5px]"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  "image-to-pdf": (
    <div className="tc-scene tc-img-pdf-scene flex items-center gap-1">
      <div className="tc-img-side">
        <div className="tc-photo-frame w-10 h-8.5 rounded-[5px] border border-[#85B7EB] bg-[#E6F1FB] overflow-hidden relative shrink-0">
          <div className="tc-photo-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-photo-sun absolute top-1.25 right-1.5 w-2.25 h-2.25 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-photo-hills absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,16 10,4 18,9 28,2 40,16"
              fill="#5DCAA5"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
      <div className="tc-arrow text-[20px] text-[#999] shrink-0 mx-1.5 opacity-50">
        ›
      </div>
      <div className="tc-pdf-out-side">
        <div className="tc-doc tc-doc--pdf w-8.5 h-11 rounded-sm relative flex flex-col items-center justify-end pb-1.75 shrink-0 bg-[#FAECE7] border border-[#F0997B]">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold tracking-[0.4px] text-[#993C1D]">
            PDF
          </span>
          <div className="tc-pdf-lines absolute bottom-1.75 left-1.25 right-1.25">
            <div className="tc-pdf-line h-[1.5px] rounded-[1px] mb-[2.5px] bg-[#F0997B] opacity-60 w-[80%]" />
            <div className="tc-pdf-line h-[1.5px] rounded-[1px] mb-[2.5px] bg-[#F0997B] opacity-60 w-[60%]" />
            <div className="tc-pdf-line h-[1.5px] rounded-[1px] mb-[2.5px] bg-[#F0997B] opacity-60 w-[72%]" />
          </div>
        </div>
      </div>
    </div>
  ),

  "pdf-merge": (
    <div className="tc-scene tc-merge-scene flex items-center gap-1.5">
      <div className="tc-merge-stack relative w-9.5 h-12.5 shrink-0">
        <div className="tc-doc tc-doc--merge tc-doc--merge-1 absolute w-7.5 h-10 rounded-sm bg-[#FAECE7] border border-[#F0997B] top-0 left-2 z-3">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-bold text-[#993C1D]">
            PDF
          </span>
        </div>
        <div className="tc-doc tc-doc--merge tc-doc--merge-2 absolute w-7.5 h-10 rounded-sm bg-[#FAECE7] border border-[#F0997B] top-1 left-1 z-2 opacity-70">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-bold text-[#993C1D]">
            PDF
          </span>
        </div>
        <div className="tc-doc tc-doc--merge tc-doc--merge-3 absolute w-7.5 h-10 rounded-sm bg-[#FAECE7] border border-[#F0997B] top-2 left-0 z-1 opacity-40">
          <span className="tc-doc__tag absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-bold text-[#993C1D]">
            PDF
          </span>
        </div>
      </div>
      <div className="tc-arrow text-[20px] text-[#999] shrink-0 mx-1.5 opacity-50">
        ›
      </div>
      <div className="tc-doc tc-doc--merged w-8.5 h-11 rounded-sm relative flex flex-col items-center justify-end pb-1.75 bg-[#FAECE7] border border-[#F0997B]">
        <span className="tc-doc__tag absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-[#993C1D]">
          PDF
        </span>
        <div className="tc-merge-lines absolute bottom-1.5 left-1.25 right-1.25">
          <div className="tc-merge-line tc-merge-line--1 h-[1.5px] rounded-[1px] bg-[#F0997B] opacity-0 mb-0.75 w-[80%]" />
          <div className="tc-merge-line tc-merge-line--2 h-[1.5px] rounded-[1px] bg-[#F0997B] opacity-0 mb-0.75 w-[55%]" />
          <div className="tc-merge-line tc-merge-line--3 h-[1.5px] rounded-[1px] bg-[#F0997B] opacity-0 mb-0.75 w-[68%]" />
        </div>
      </div>
    </div>
  ),

  "pdf-sign": (
    <div className="tc-scene tc-sign-scene">
      <div className="tc-sign-doc w-13 h-15.5 rounded-[5px] bg-[#EEEDFE] border border-[#AFA9EC] relative pt-2.5 px-1.5 pb-1.5 flex flex-col gap-1">
        <div className="tc-sign-lines flex flex-col gap-0.75">
          <div className="tc-sign-line h-0.5 rounded-[1px] bg-[#AFA9EC] opacity-50 w-full" />
          <div className="tc-sign-line h-0.5 rounded-[1px] bg-[#AFA9EC] opacity-50 w-[75%]" />
          <div className="tc-sign-line h-0.5 rounded-[1px] bg-[#AFA9EC] opacity-50 w-[88%]" />
        </div>
        <div className="tc-sign-area border-t border-dashed border-[#AFA9EC] mt-0.5 pt-0.5 h-7 flex items-center justify-center">
          <svg
            className="tc-signature"
            viewBox="0 0 60 24"
            width="60"
            height="24"
          >
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
        <div className="tc-sign-badge absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#1D9E75] whitespace-nowrap opacity-0">
          ✓ Signed
        </div>
      </div>
    </div>
  ),

  "image-compress": (
    <div className="tc-scene tc-compress-scene">
      <div className="tc-compress-wrap flex flex-col items-center gap-1.5">
        <div className="tc-compress-photo w-13.5 h-10 rounded-md bg-[#E6F1FB] border border-[#85B7EB] overflow-hidden relative">
          <div className="tc-compress-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-compress-sun absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 44 18"
            width="44"
            height="18"
            className="tc-compress-hills absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,18 11,5 20,10 30,2 44,18"
              fill="#5DCAA5"
              opacity="0.7"
            />
          </svg>
        </div>
        <div className="tc-compress-bar-wrap w-13.5">
          <div className="tc-compress-bar-bg h-1.25 rounded-[3px] bg-[#e0e0e0] overflow-hidden">
            <div
              className="tc-compress-bar-fill h-full rounded-[3px] w-full"
              style={{
                background: "linear-gradient(90deg, #1D9E75, #5DCAA5)",
                transformOrigin: "left center",
              }}
            />
          </div>
          <div className="tc-compress-labels flex justify-between mt-0.75">
            <span className="tc-compress-before text-[8px] text-[#993556] opacity-100">
              4.2 MB
            </span>
            <span className="tc-compress-after text-[8px] text-[#1D9E75] opacity-0">
              1.1 MB
            </span>
          </div>
        </div>
      </div>
    </div>
  ),

  "image-upscale": (
    <div className="tc-scene tc-upscale-scene">
      <div className="tc-upscale-wrap flex items-end gap-1.25 relative">
        <div className="tc-upscale-frame tc-upscale-frame--small w-7 h-5.5 rounded-[5px] bg-[#E6F1FB] border border-[#85B7EB] overflow-hidden relative shrink-0">
          <div className="tc-upscale-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-upscale-sun absolute top-1 right-1.25 w-1.75 h-1.75 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg viewBox="0 0 24 10" width="24" height="10">
            <polygon
              points="0,10 6,3 11,6 16,1 24,10"
              fill="#5DCAA5"
              opacity="0.8"
            />
          </svg>
        </div>
        <div className="tc-upscale-arrow text-[16px] text-[#7F77DD] font-bold mb-1">
          ↗
        </div>
        <div className="tc-upscale-frame tc-upscale-frame--big w-11 h-9 rounded-[5px] bg-[#E6F1FB] border border-[#85B7EB] overflow-hidden relative shrink-0">
          <div className="tc-upscale-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-upscale-sun absolute top-1 right-1.25 w-1.75 h-1.75 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg viewBox="0 0 40 16" width="40" height="16">
            <polygon
              points="0,16 10,4 18,9 28,2 40,16"
              fill="#5DCAA5"
              opacity="0.8"
            />
          </svg>
        </div>
        <div className="tc-upscale-badge absolute -top-2 -right-1.5 bg-[#7F77DD] text-white text-[8px] font-bold px-1.25 py-0.5 rounded-sm opacity-0">
          HD
        </div>
      </div>
    </div>
  ),
  

  "image-to-webp": (
    <div className="tc-scene tc-webp-scene">
      <div className="tc-webp-wrap flex items-center gap-1.25">
        <div className="tc-webp-photo w-10 h-8.5 rounded-[5px] bg-[#E6F1FB] border border-[#85B7EB] overflow-hidden relative shrink-0">
          <div className="tc-webp-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-webp-sun absolute top-1.25 right-1.5 w-2.25 h-2.25 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-webp-hills absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,16 10,4 18,9 28,2 40,16"
              fill="#5DCAA5"
              opacity="0.8"
            />
          </svg>
        </div>
        <div className="tc-arrow text-[20px] text-[#999] shrink-0 mx-1.5 opacity-50">
          ›
        </div>
        <div className="tc-webp-badge-wrap">
          <div className="tc-webp-doc w-8.5 h-11 rounded-sm bg-[#E1F5EE] border border-[#5DCAA5] relative flex items-center justify-center">
            <span className="tc-webp-tag text-[8px] font-bold text-[#085041] tracking-[0.3px]">
              WebP
            </span>
          </div>
        </div>
      </div>
    </div>
  ),

  "image-to-jpg": (
    <div className="tc-scene tc-jpg-scene">
      <div className="tc-jpg-wrap relative flex items-center justify-center">
        <div className="tc-jpg-stack relative w-14 h-12.5">
          <div className="tc-jpg-frame tc-jpg-frame--back w-12 h-10.5 rounded-md bg-[#FAEEDA] border border-[#EF9F27] overflow-hidden absolute top-1.5 left-2 opacity-50">
            <div className="tc-jpg-sky absolute inset-0 bg-[#FAEEDA]" />
            <div className="tc-jpg-sun absolute top-1.75 right-2 w-2.5 h-2.5 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          </div>
          <div className="tc-jpg-frame tc-jpg-frame--front w-12 h-10.5 rounded-md bg-[#FAEEDA] border border-[#EF9F27] overflow-hidden absolute top-0 left-0 z-1">
            <div className="tc-jpg-sky absolute inset-0 bg-[#FAEEDA]" />
            <div
              className="tc-jpg-sun absolute rounded-full bg-[#EF9F27] border border-[#BA7517]"
              style={{ right: 6, top: 5, width: 9, height: 9 }}
            />
            <svg
              viewBox="0 0 48 18"
              width="48"
              height="18"
              className="tc-jpg-hills absolute bottom-0 left-0 right-0"
            >
              <polygon
                points="0,18 10,5 20,10 32,2 48,18"
                fill="#D85A30"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
        <div className="tc-jpg-badge absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#FAEEDA] border border-[#EF9F27] text-[#633806] text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] whitespace-nowrap opacity-0">
          JPG
        </div>
      </div>
    </div>
  ),

  "image-to-grayscale": (
    <div className="tc-scene tc-grayscale-scene">
      <div className="tc-grayscale-wrap flex items-center gap-1.5">
        <div className="tc-grayscale-photo tc-grayscale-photo--color w-10 h-8.5 rounded-[5px] overflow-hidden relative shrink-0 border border-[#85B7EB]">
          <div className="tc-gs-sky tc-gs-sky--color absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-gs-sun absolute top-1.25 right-1.5 w-2.25 h-2.25 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-gs-hills tc-gs-hills--color absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,16 10,4 18,9 28,2 40,16"
              fill="#5DCAA5"
              opacity="0.8"
            />
          </svg>
        </div>
        <div className="tc-arrow text-[20px] text-[#999] shrink-0 mx-1.5 opacity-50">
          ›
        </div>
        <div className="tc-grayscale-photo tc-grayscale-photo--gray w-10 h-8.5 rounded-[5px] overflow-hidden relative shrink-0 border border-[#aaa]">
          <div className="tc-gs-sky tc-gs-sky--gray absolute inset-0 bg-[#e0e0e0]" />
          <div className="tc-gs-sun tc-gs-sun--gray absolute top-1.25 right-1.5 w-2.25 h-2.25 rounded-full bg-[#aaa] border border-[#888]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-gs-hills tc-gs-hills--gray absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,16 10,4 18,9 28,2 40,16"
              fill="#888"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
    </div>
  ),

  "remove-bg": (
    <div className="tc-scene tc-removebg-scene">
      <div className="tc-removebg-wrap w-13 h-15.5 relative">
        <div
          className="tc-rb-checker absolute inset-0 rounded-md opacity-0"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
            backgroundColor: "#fff",
          }}
        />
        <div className="tc-rb-bg absolute inset-0 rounded-md bg-[#E6F1FB] border border-[#85B7EB]" />
        <div className="tc-rb-person absolute inset-0 flex flex-col items-center justify-center gap-0.75 z-1">
          <div className="tc-rb-head w-4 h-4 rounded-full bg-[#EEEDFE] border border-[#7F77DD]" />
          <div className="tc-rb-torso w-6.5 h-6 rounded-t-[5px] bg-[#EEEDFE] border border-[#7F77DD]" />
        </div>
        <div className="tc-rb-check absolute -top-1.25 -right-1.5 z-2 w-4.5 h-4.5 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-bold opacity-0">
          ✓
        </div>
      </div>
    </div>
  ),
  "pdf-rotate-flip": (
    <div className="tc-scene flex items-center justify-center group">
      <div className="relative w-17.5 h-13.5 flex items-center justify-center">
        <div
          className="
          relative w-6 h-8.5
          rounded-sm
          bg-[#FFF8F5]
          border border-[#F0997B]
          shadow-sm
          transition-all duration-500 ease-out
          group-hover:scale-110
          group-hover:scale-x-[-1]
        "
        >
          <div className="absolute inset-0 group-hover:scale-x-[-1] transition-all duration-500">
            <div className="absolute top-1.75 left-1 right-1 h-[1.5px] rounded-full bg-[#D85A30] opacity-70" />
            <div className="absolute top-3.25 left-1 right-2 h-[1.5px] rounded-full bg-[#D85A30] opacity-45" />
            <div className="absolute top-4.75 left-1 right-1.5 h-[1.5px] rounded-full bg-[#D85A30] opacity-30" />

            <span className="absolute bottom-1.25 left-1/2 -translate-x-1/2 text-[6px] font-bold text-[#D85A30]">
              PDF
            </span>
          </div>
        </div>
      </div>
    </div>
  ),

  "rotate-flip": (
    <div className="tc-scene tc-rotate-scene">
      <div className="tc-rotate-wrap relative flex items-center justify-center">
        <div className="tc-rot-frame w-12.5 h-12.5 rounded-md bg-[#FAEEDA] border border-[#EF9F27] overflow-hidden relative">
          <div className="tc-rot-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-rot-sun absolute top-1.75 right-2 w-2.5 h-2.5 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 48 18"
            width="48"
            height="18"
            className="tc-rot-hills absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,18 11,5 20,11 30,2 48,18"
              fill="#EF9F27"
              opacity="0.7"
            />
          </svg>
        </div>
        <div className="tc-rot-arrow absolute -bottom-1 -right-1.5 text-[20px] text-[#EF9F27] font-bold opacity-0">
          ↻
        </div>
      </div>
    </div>
  ),

  "image-resize": (
    <div className="tc-scene tc-resize-scene">
      <div className="tc-resize-wrap relative flex items-end gap-1.25">
        <div className="tc-resize-frame tc-resize-frame--big w-12 h-10 rounded-[5px] bg-[#E1F5EE] border border-[#5DCAA5] overflow-hidden relative shrink-0">
          <div className="tc-resize-sky absolute inset-0 bg-[#E1F5EE]" />
          <div className="tc-resize-sun absolute top-1.25 right-1.25 w-2 h-2 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 48 18"
            width="48"
            height="18"
            className="tc-resize-hills absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,18 11,5 20,11 30,2 48,18"
              fill="#5DCAA5"
              opacity="0.7"
            />
          </svg>
        </div>
        <div className="tc-resize-frame tc-resize-frame--small w-7 h-6 rounded-[5px] bg-[#E1F5EE] border border-[#5DCAA5] overflow-hidden relative shrink-0">
          <div className="tc-resize-sky absolute inset-0 bg-[#E1F5EE]" />
          <div className="tc-resize-sun absolute top-1.25 right-1.25 w-2 h-2 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 28 10"
            width="28"
            height="10"
            className="tc-resize-hills absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,10 6,3 11,6 16,1 28,10"
              fill="#5DCAA5"
              opacity="0.7"
            />
          </svg>
        </div>
        <div className="tc-resize-badge absolute -top-2 left-1/2 -translate-x-1/2 text-[14px] text-[#1D9E75] font-bold opacity-0">
          ↔
        </div>
      </div>
    </div>
  ),

  "image-dpi": (
    <div className="tc-scene tc-dpi-scene">
      <div className="tc-dpi-wrap flex items-center gap-1.5 relative">
        <div className="tc-dpi-frame w-9.5 h-9.5 rounded-md bg-[#EAF3DE] border border-[#97C459] flex items-center justify-center shrink-0">
          <div
            className="tc-dpi-dots grid gap-0.5"
            style={{ gridTemplateColumns: "repeat(3, 8px)" }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="tc-dpi-dot tc-dpi-dot--low w-2 h-2 rounded-full bg-[#639922] opacity-50"
              />
            ))}
          </div>
        </div>
        <div className="tc-arrow text-[20px] text-[#999] shrink-0 mx-1.5 opacity-50">
          ›
        </div>
        <div className="tc-dpi-frame w-9.5 h-9.5 rounded-md bg-[#EAF3DE] border border-[#97C459] flex items-center justify-center shrink-0">
          <div
            className="tc-dpi-dots grid gap-0.5"
            style={{ gridTemplateColumns: "repeat(5, 4px)" }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="tc-dpi-dot tc-dpi-dot--high w-1 h-1 rounded-full bg-[#639922] opacity-70"
              />
            ))}
          </div>
        </div>
        <div className="tc-dpi-label absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#3B6D11] whitespace-nowrap opacity-50">
          72 → 300 DPI
        </div>
      </div>
    </div>
  ),

  "image-metadata": (
    <div className="tc-scene tc-metadata-scene">
      <div className="tc-meta-shell w-13 h-15.5 rounded-[5px] bg-[#EEEDFE] border border-[#AFA9EC] relative overflow-hidden pt-3 px-1.5 pb-1.5">
        <div className="tc-meta-rows flex flex-col gap-1.25">
          {[100, 60, 80, 50, 70].map((w, i) => (
            <div key={i} className="tc-meta-row flex items-center gap-0.75">
              <div className="tc-meta-key w-2.5 h-0.5 rounded-[1px] bg-[#7F77DD] shrink-0" />
              <div
                className="tc-meta-val h-0.5 rounded-[1px] bg-[#AFA9EC] opacity-60"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
        </div>
        <div
          className="tc-meta-scanner absolute left-0 right-0 h-0.5 bg-[#534AB7] opacity-0"
          style={{ top: 10, boxShadow: "0 0 6px #534AB7" }}
        />
      </div>
    </div>
  ),

  "image-to-base64": (
    <div className="tc-scene tc-base64-scene">
      <div className="tc-b64-wrap flex items-center gap-1.5">
        <div className="tc-b64-photo w-9.5 h-8.5 rounded-[5px] bg-[#E6F1FB] border border-[#85B7EB] overflow-hidden relative shrink-0">
          <div className="tc-b64-sky absolute inset-0 bg-[#E6F1FB]" />
          <div className="tc-b64-sun absolute top-1.25 right-1.25 w-2 h-2 rounded-full bg-[#EF9F27] border border-[#BA7517]" />
          <svg
            viewBox="0 0 40 16"
            width="40"
            height="16"
            className="tc-b64-hills absolute bottom-0 left-0 right-0"
          >
            <polygon
              points="0,16 10,4 18,9 28,2 40,16"
              fill="#5DCAA5"
              opacity="0.8"
            />
          </svg>
        </div>
        <div className="tc-arrow text-[20px] text-[#999] shrink-0 mx-1.5 opacity-50">
          ›
        </div>
        <div className="tc-b64-code w-11 h-12 rounded-[5px] bg-[#1E1E2E] border border-[#444] p-[6px_5px] flex flex-col gap-1 relative overflow-hidden">
          <div className="tc-b64-line h-0.5 rounded-[1px] bg-[#5DCAA5] opacity-70 w-[90%]" />
          <div className="tc-b64-line h-0.5 rounded-[1px] bg-[#5DCAA5] opacity-70 w-[70%]" />
          <div className="tc-b64-line h-0.5 rounded-[1px] bg-[#5DCAA5] opacity-70 w-[85%]" />
          <div className="tc-b64-line h-0.5 rounded-[1px] bg-[#5DCAA5] opacity-70 w-[55%]" />
          <div className="tc-b64-cursor w-0.5 h-2 bg-[#5DCAA5] rounded-[1px] opacity-0 absolute bottom-1.5 right-1.5" />
        </div>
      </div>
    </div>
  ),

  "md-to-html": markdownToHtmlAnimation,

  "image-ocr": imageOcrAnimation,

  "docx-to-pdf": docToPdfAnimation,

  "image-to-svg": imageToSvgAnimation,

  "pdf-split": pdfSplitAnimation,

  "pdf-watermark": pdfWatermarkAnimation,

  "image-watermark": imageWatermarkAnimation,

  "url-to-qr": urlToQrAnimation,

  "image-blur": (
    <div className="tc-scene tc-blur-scene flex items-center justify-center">
      <div className="tc-blur-image w-13.5 h-10 rounded-lg bg-[#E6F1FB] border border-[#85B7EB] flex items-center justify-center">
        <Image />
      </div>
    </div>
  ),
};

const processingStyles = {
  frontend: {
    card: "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/70 hover:border-emerald-400 dark:hover:border-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200",
    label: "Runs in your browser",
  },
  backend: {
    card: "bg-rose-50/35 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/70 hover:border-rose-400 dark:hover:border-rose-500",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200",
    label: "Requires file upload",
  },
};

const ToolCard = ({ tool, index }) => {
  const processing =
    tool.processingLocation === "backend"
      ? processingStyles.backend
      : processingStyles.frontend;

  return (
  <Link
    to={tool.path}
    className={`group relative p-4 md:p-8 rounded-2xl shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up flex flex-col h-full min-h-50 md:min-h-60 ${processing.card}`}
    style={{ animationDelay: `${1000 + index * 100}ms` }}
  >
    <div
      className={`absolute inset-0 rounded-2xl bg-linear-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
    />
    <div className="w-full h-20 flex items-center justify-center mb-6 relative">
      {toolAnimations[tool.id] ?? (
        <div
          className={`w-14 h-14 rounded-xl bg-linear-to-br ${tool.iconGradient} p-px tc-icon-float`}
        >
          <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center">
            {React.cloneElement(tool.icon, {
              className: "w-7 h-7 text-slate-800 dark:text-slate-100",
            })}
          </div>
        </div>
      )}
    </div>

    <h3 className="text-base md:text-xl leading-tight font-bold text-slate-900 dark:text-white mb-1 md:mb-3 text-center md:text-left max-w-30 mx-auto md:mx-0 line-clamp-2 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-slate-900 group-hover:to-blue-700 group-hover:bg-clip-text transition-all duration-300">
      {tool.name}
    </h3>
    <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed flex-1 text-center md:text-left">
      {tool.description}
    </p>

    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      <ArrowRight className="w-6 h-6 text-blue-600" />
    </div>
    <span
      className={`self-center md:self-start mt-4 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${processing.badge}`}
    >
      {processing.label}
    </span>
  </Link>
  );
};

export default ToolCard;
