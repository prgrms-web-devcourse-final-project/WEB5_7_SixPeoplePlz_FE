"use client";

import { Button, Card } from "@/components/ui";
import type { StepProps, FormData } from "@/app/contracts/create/page";
import type { ParticipantSimpleResponse } from "../../../docs/data-contracts";
import { useState } from "react";
import { getImageUrl } from "@/lib/env";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Template = {
  id: "BASIC" | "JOSEON" | "CASUAL" | "CHILD" | "STUDENT";
  name: string;
  description: string;
  icon: string;
  previewComponent: React.FC<{
    formData: FormData;
    participants?: ParticipantSimpleResponse[];
    contractorSignatureKey?: string;
    supervisorSignatures?: Array<{ name: string; signatureKey: string }>;
  }>;
};

const BasicPreview: React.FC<{
  formData: FormData;
  participants?: ParticipantSimpleResponse[];
  contractorSignatureKey?: string;
  supervisorSignatures?: Array<{ name: string; signatureKey: string }>;
}> = ({
  formData,
  participants = [],
  contractorSignatureKey,
  supervisorSignatures = [],
}) => {
  const startDate = formData.startDate
    ? new Date(formData.startDate).toLocaleDateString()
    : "[시작일]";
  const endDate = formData.endDate
    ? new Date(formData.endDate).toLocaleDateString()
    : "[종료일]";

  const contractor = participants.find(
    (p) =>
      (p as any).basicInfo?.role === "CONTRACTOR" || p.role === "CONTRACTOR"
  );
  const contractorName =
    (contractor as any)?.basicInfo?.userName ||
    contractor?.userName ||
    "[서명 후 입력됩니다]";

  const supervisors = participants.filter((p) => {
    const role = (p as any).basicInfo?.role || p.role;
    const valid = (p as any).basicInfo?.valid ?? p.valid;
    return role === "SUPERVISOR" && valid;
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
            @font-face {
                font-family: 'Pretendard-Regular';
                src: url('https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
                font-weight: 400;
                font-style: normal;
            }
            .basic-container, .basic-container * { 
                font-family: 'Pretendard-Regular', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
            }
            .basic-container {
                background-color: #ffffff !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 8px !important;
                padding: 2rem !important;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
            }
            .basic-title {
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                color: #1e3a8a !important;
                background-color: #eff6ff !important;
                text-align: center !important;
                padding: 1rem !important;
                border-radius: 8px 8px 0 0 !important;
                margin-bottom: 1.5rem !important;
            }
            .basic-content {
                font-size: 1rem !important;
                line-height: 1.6 !important;
                color: #374151 !important;
                padding: 1rem !important;
            }
            .basic-heading {
                font-size: 1.125rem !important;
                font-weight: 600 !important;
                border-bottom: 1px solid #d1d5db !important;
                padding-bottom: 0.5rem !important;
                margin-bottom: 0.75rem !important;
                color: #374151 !important;
                text-align: left !important;
                display: block !important;
            }
            .basic-list {
                list-style-type: disc !important;
                padding-left: 1.5rem !important;
                margin: 0.5rem 0 !important;
            }
            .basic-list-item {
                margin-bottom: 0.25rem !important;
                line-height: 1.6 !important;
            }
            .basic-reward-list {
                list-style-type: disc !important;
                padding-left: 1.5rem !important;
                margin: 0.5rem 0 !important;
            }
            .basic-penalty-list {
                list-style-type: disc !important;
                padding-left: 1.5rem !important;
                margin: 0.5rem 0 !important;
            }
            .basic-center-text {
                text-align: center !important;
                display: block !important;
                margin: 1.5rem 0 !important;
            }
            .basic-highlight {
                font-weight: 600 !important;
                color: #2563eb !important;
            }
            .basic-penalty {
                font-weight: 600 !important;
                color: #dc2626 !important;
            }
            .basic-signature-row {
                display: table !important;
                width: 100% !important;
                margin-bottom: 0.75rem !important;
                table-layout: fixed !important;
            }
            .basic-signature-label {
                display: table-cell !important;
                width: 60% !important;
                vertical-align: middle !important;
                text-align: left !important;
                padding-right: 1rem !important;
            }
            .basic-signature-value {
                display: table-cell !important;
                width: 40% !important;
                vertical-align: middle !important;
                text-align: right !important;
                white-space: nowrap !important;
            }
          `,
        }}
      />
      <div className="basic-container w-full">
        <h4 className="basic-title">계 약 서</h4>
        <div className="basic-content space-y-6">
          <div>
            <h5 className="basic-heading">제 1조 (계약의 목적)</h5>
            <p className="leading-relaxed text-base">
              본 계약은 계약자{" "}
              <span className="basic-highlight">
                {participants.find((p) => p.role === "CONTRACTOR")?.userName ||
                  "[계약자명]"}
              </span>
              이(가) <span className="basic-highlight">{startDate}</span>
              부터 <span className="basic-highlight">{endDate}</span>
              까지{" "}
              <span className="basic-highlight">
                {formData.title || "[목표 제목]"}
              </span>
              을(를) 달성하는 것을 목적으로 한다.
            </p>
          </div>
          <div>
            <h5 className="basic-heading">제 2조 (의무 및 책임)</h5>
            <p className="leading-relaxed text-base">
              계약자는 계약 기간 동안 총{" "}
              <span className="basic-highlight">
                {formData.totalProof || "[횟수]"}
              </span>
              회의 목표를 수행해야 한다.
            </p>
          </div>
          <div>
            <h5 className="basic-heading">제 3조 (계약의 이행 및 불이행)</h5>
            {(formData.reward || formData.penalty) && (
              <>
                {formData.reward && (
                  <div className="mt-2">
                    <p className="font-medium text-base">• 계약 이행 시:</p>
                    <ul className="basic-reward-list">
                      <li className="basic-list-item">
                        <span className="basic-highlight">
                          {formData.reward}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
                {formData.penalty && (
                  <div className="mt-3">
                    <p className="font-medium text-base">• 계약 불이행 시:</p>
                    <ul className="basic-penalty-list">
                      <li className="basic-list-item">
                        <span className="basic-penalty">
                          {formData.penalty}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <h5 className="basic-heading">제 4조 (특약 사항)</h5>
            <ul className="basic-list">
              <li className="basic-list-item">
                모든 감독자가 계약의 감독을 중도 포기할 경우, 계약자는 불이행에
                따른 책임을 면한다.
              </li>
              <li className="basic-list-item">
                계약자가 스스로 계약을 중도포기할 경우, 계약자는 본 계약에서
                정한 불이행 조치를 이행하여야 한다.
              </li>
            </ul>
          </div>
          <div className="pt-6 text-center text-base text-[#6b7280]">
            <p className="basic-center-text">
              상기 계약 내용을 확인하였으며, 이를 성실히 이행할 것을 서약합니다.
            </p>
            <div className="mt-6 space-y-4 text-left text-base">
              {/* 계약자 서명 */}
              <div className="basic-signature-row">
                <span className="basic-signature-label">
                  <strong>계약자:</strong>
                </span>
                <span className="basic-signature-value">
                  {contractorName}
                  {formData.signatureImageKey || contractorSignatureKey ? (
                    contractorSignatureKey === "INVITATION_PREVIEW" ? (
                      <span className="text-[#2563eb] font-semibold text-sm ml-2">
                        서명 완료
                      </span>
                    ) : (
                      <img
                        src={
                          formData.signatureImageUrl ||
                          getImageUrl(
                            formData.signatureImageKey ||
                              contractorSignatureKey!
                          )
                        }
                        alt="user signature"
                        className="h-8 w-16 object-contain ml-2"
                      />
                    )
                  ) : (
                    <span className="text-[#6b7280] ml-2">(서명)</span>
                  )}
                </span>
              </div>

              {/* 감독자 서명 */}
              {supervisorSignatures.length > 0
                ? supervisorSignatures.map((sig, index) => (
                    <div key={index} className="basic-signature-row">
                      <span className="basic-signature-label">
                        <strong>감독자</strong>
                      </span>
                      <span className="basic-signature-value">
                        {sig.name}
                        <img
                          src={getImageUrl(sig.signatureKey)}
                          alt="supervisor signature"
                          className="h-8 w-16 object-contain ml-2"
                        />
                      </span>
                    </div>
                  ))
                : supervisors.map((supervisor, index) => (
                    <div key={index} className="basic-signature-row">
                      <span className="basic-signature-label">
                        <strong>감독자</strong>
                      </span>
                      <span className="basic-signature-value">
                        {supervisor.userName}
                        <span className="text-[#6b7280] ml-2">(서명)</span>
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const JoseonPreview: React.FC<{
  formData: FormData;
  participants?: ParticipantSimpleResponse[];
  contractorSignatureKey?: string;
  supervisorSignatures?: Array<{ name: string; signatureKey: string }>;
}> = ({
  formData,
  participants = [],
  contractorSignatureKey,
  supervisorSignatures = [],
}) => {
  const startDate = formData.startDate
    ? new Date(formData.startDate).toLocaleDateString()
    : "[시작일]";
  const endDate = formData.endDate
    ? new Date(formData.endDate).toLocaleDateString()
    : "[종료일]";

  const contractor = participants.find(
    (p) =>
      (p as any).basicInfo?.role === "CONTRACTOR" || p.role === "CONTRACTOR"
  );
  const contractorName =
    (contractor as any)?.basicInfo?.userName ||
    contractor?.userName ||
    "[서명 후 입력됩니다]";

  const supervisors = participants.filter((p) => {
    const role = (p as any).basicInfo?.role || p.role;
    const valid = (p as any).basicInfo?.valid ?? p.valid;
    return role === "SUPERVISOR" && valid;
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap');
        @font-face {
          font-family: 'Shilla_CultureB-Bold';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/Shilla_CultureB-Bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }
        .yakjjo-container, .yakjjo-container * { 
          font-family: 'Shilla_CultureB-Bold', 'Noto Serif KR', serif !important; 
        }
        .yakjjo-container { 
          background-color: #FDF6E3 !important; 
          border: 3px solid #8B4513 !important; 
          padding: 2rem !important; 
          border-radius: 8px !important;
          box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1) !important;
          margin: 0 !important;
          width: 100% !important;
        }
        .yakjjo-title { 
          text-align: center !important; 
          font-size: 1.5rem !important; 
          font-weight: 700 !important; 
          margin-bottom: 1.5rem !important; 
          color: #8B4513 !important;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1) !important;
        }
        .yakjjo-body { 
          font-size: 1rem !important; 
          line-height: 1.8 !important; 
          color: #2D1810 !important;
        }
        .yakjjo-heading { 
          font-weight: 700 !important; 
          border-bottom: 2px solid #B4846C !important; 
          padding-bottom: 0.5rem !important; 
          margin-bottom: 1rem !important; 
          color: #8B4513 !important;
          font-size: 1.1rem !important;
          text-align: left !important;
          display: block !important;
        }
        .yakjjo-list {
            list-style-type: disc !important;
            padding-left: 1.5rem !important;
            margin: 0.5rem 0 !important;
        }
        .yakjjo-list-item {
            margin-bottom: 0.25rem !important;
            line-height: 1.8 !important;
        }
        .yakjjo-center-text {
            text-align: center !important;
            display: block !important;
            margin: 2rem 0 1rem 0 !important;
        }
        .highlight { 
          font-weight: 800 !important; 
          color: #A0522D !important; 
          background-color: rgba(160, 82, 45, 0.1) !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
        }
        .yakjjo-reward {
          font-weight: 600 !important;
          color: #166534 !important;
        }
        .yakjjo-penalty {
          font-weight: 600 !important;
          color: #991b1b !important;
        }
        .yakjjo-signature {
          margin-top: 2rem !important;
          padding-top: 1rem !important;
          border-top: 1px solid #B4846C !important;
          text-align: center !important;
          font-size: 0.9rem !important;
          color: #2D1810 !important;
        }
        .yakjjo-signature-row {
                display: table !important;
                width: 100% !important;
                margin-bottom: 0.75rem !important;
                table-layout: fixed !important;
            }
            .yakjjo-signature-label {
                display: table-cell !important;
                width: 60% !important;
                vertical-align: middle !important;
                text-align: left !important;
                padding-right: 1rem !important;
            }
            .yakjjo-signature-value {
                display: table-cell !important;
                width: 40% !important;
                vertical-align: middle !important;
                text-align: right !important;
                white-space: nowrap !important;
            }
      `,
        }}
      />
      <div className="yakjjo-container">
        <h2 className="yakjjo-title">📜 약조문 (約條文) 📜</h2>
        <div className="yakjjo-body space-y-4">
          <div>
            <h3 className="yakjjo-heading">제 1조 (약조의 연유)</h3>
            <p>
              본인 <span className="highlight">{contractorName}</span>
              은(는), 신묘년({new Date(formData.startDate || "").getFullYear()}
              년) {new Date(formData.startDate || "").getMonth() + 1}월{" "}
              {new Date(formData.startDate || "").getDate()}일부터{" "}
              {new Date(formData.endDate || "").getMonth() + 1}월{" "}
              {new Date(formData.endDate || "").getDate()}일까지{" "}
              <span className="highlight">
                '{formData.title || "[목표 제목]"}'
              </span>
              을(를) 행할 것을 천지신명께 고하노라.
            </p>
          </div>
          <div>
            <h3 className="yakjjo-heading">제 2조 (이행의 방식)</h3>
            <p>
              약조 기간내에 도합{" "}
              <span className="highlight">
                {formData.totalProof || "[횟수]"}
              </span>
              번을 완수하여야 한다.
            </p>
          </div>
          <div>
            <h3 className="yakjjo-heading">제 3조 (신상필벌)</h3>
            {(formData.reward || formData.penalty) && (
              <>
                {formData.reward && (
                  <p>
                    🌸 약조를 완수하였을 시:{" "}
                    <span className="yakjjo-reward">
                      큰 상을 내릴 것이니라. ({formData.reward})
                    </span>
                  </p>
                )}
                {formData.penalty && (
                  <p>
                    😡 약조를 어겼을 시:{" "}
                    <span className="yakjjo-penalty">
                      엄중한 벌을 면치 못할 것이야. ({formData.penalty})
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <h3 className="yakjjo-heading">제 4조 (특약 사항)</h3>
            <ul className="yakjjo-list">
              <li className="yakjjo-list-item">
                입회인 전원이 감시를 포기한다면, 약조를 지키지 못했더라도 그
                책임을 묻지 아니한다.
              </li>
              <li className="yakjjo-list-item">
                허나, 약조 당사자가 먼저 포기를 청한다면, 마땅히 정해진 벌을
                달게 받아야 할지니.
              </li>
            </ul>
          </div>
          <div className="yakjjo-signature">
            <p className="yakjjo-center-text">
              상기 내용을 모두 숙지하였으며, 어떠한 경우에도 이를 성실히 이행할
              것을 서약하노라.
            </p>
            <div className="mt-4 space-y-3">
              {/* 계약자 서명 */}
              <div className="yakjjo-signature-row">
                <span className="yakjjo-signature-label">
                  <strong>약조인(約條人):</strong>
                </span>
                <span className="yakjjo-signature-value">
                  {contractorName}
                  {formData.signatureImageKey || contractorSignatureKey ? (
                    contractorSignatureKey === "INVITATION_PREVIEW" ? (
                      <span className="text-[#8B4513] font-semibold text-sm ml-2">
                        서명 완료
                      </span>
                    ) : (
                      <img
                        src={
                          formData.signatureImageUrl ||
                          getImageUrl(
                            formData.signatureImageKey ||
                              contractorSignatureKey!
                          )
                        }
                        alt="user signature"
                        className="h-8 w-16 object-contain ml-2"
                      />
                    )
                  ) : (
                    <span className="text-[#8B4513] ml-2">(수결)</span>
                  )}
                </span>
              </div>

              {/* 감독자 서명 */}
              {supervisorSignatures.length > 0
                ? supervisorSignatures.map((sig, index) => (
                    <div key={index} className="yakjjo-signature-row">
                      <span className="yakjjo-signature-label">
                        <strong>입회인(立會人):</strong>
                      </span>
                      <span className="yakjjo-signature-value">
                        {sig.name}
                        <img
                          src={getImageUrl(sig.signatureKey)}
                          alt="supervisor signature"
                          className="h-8 w-16 object-contain ml-2"
                        />
                      </span>
                    </div>
                  ))
                : supervisors.map((supervisor, index) => (
                    <div key={index} className="yakjjo-signature-row">
                      <span className="yakjjo-signature-label">
                        <strong>입회인(立會人):</strong>
                      </span>
                      <span className="yakjjo-signature-value">
                        {supervisor.userName}
                        <span className="text-[#8B4513] ml-2">(수결)</span>
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CasualPreview: React.FC<{
  formData: FormData;
  participants?: ParticipantSimpleResponse[];
  contractorSignatureKey?: string;
  supervisorSignatures?: Array<{ name: string; signatureKey: string }>;
}> = ({
  formData,
  participants = [],
  contractorSignatureKey,
  supervisorSignatures = [],
}) => {
  const startDate = formData.startDate
    ? new Date(formData.startDate).toLocaleDateString()
    : "[시작일]";
  const endDate = formData.endDate
    ? new Date(formData.endDate).toLocaleDateString()
    : "[종료일]";

  const contractor = participants.find(
    (p) =>
      (p as any).basicInfo?.role === "CONTRACTOR" || p.role === "CONTRACTOR"
  );
  const contractorName =
    (contractor as any)?.basicInfo?.userName || contractor?.userName || "김○○";

  const supervisors = participants.filter((p) => {
    const role = (p as any).basicInfo?.role || p.role;
    const valid = (p as any).basicInfo?.valid ?? p.valid;
    return role === "SUPERVISOR" && valid;
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
            @font-face {
                font-family: 'YoonChildfundkoreaManSeh';
                src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408@1.0/YoonChildfundkoreaManSeh.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            .casual-container, .casual-container * { 
                font-family: 'YoonChildfundkoreaManSeh', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
            }
            .casual-container {
                background-color: #ffffff !important;
                border: 2px solid #60a5fa !important;
                border-radius: 16px !important;
                padding: 1.5rem !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                max-width: 28rem !important;
                margin: 0 auto !important;
                color: #374151 !important;
            }
            .casual-title {
                text-align: center !important;
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                margin-bottom: 2rem !important;
                color: #2563eb !important;
            }
            .casual-content {
                font-size: 1rem !important;
                line-height: 1.6 !important;
                color: #374151 !important;
            }
            .casual-heading {
                font-weight: 700 !important;
                font-size: 1.125rem !important;
                margin-bottom: 0.75rem !important;
                line-height: 1.4 !important;
                color: #374151 !important;
                text-align: left !important;
                display: block !important;
            }
            .casual-list {
                list-style-type: disc !important;
                padding-left: 1.5rem !important;
                margin: 0.5rem 0 !important;
            }
            .casual-list-item {
                margin-bottom: 0.25rem !important;
                line-height: 1.6 !important;
            }
            .casual-center-text {
                text-align: center !important;
                display: block !important;
                margin: 1.5rem 0 !important;
            }
            .casual-highlight {
                font-weight: 700 !important;
                color: #2563eb !important;
            }
            .casual-reward {
                font-weight: 700 !important;
                color: #16a34a !important;
            }
            .casual-penalty {
                font-weight: 700 !important;
                color: #dc2626 !important;
            }
            .casual-signature {
                margin-top: 1.5rem !important;
                padding-top: 1rem !important;
                border-top: 1px solid #e5e7eb !important;
                text-align: center !important;
                font-size: 0.875rem !important;
                color: #6b7280 !important;
            }
            .casual-signature-row {
                display: table !important;
                width: 100% !important;
                margin-bottom: 0.75rem !important;
                table-layout: fixed !important;
            }
            .casual-signature-label {
                display: table-cell !important;
                width: 60% !important;
                vertical-align: middle !important;
                text-align: left !important;
                padding-right: 1rem !important;
            }
            .casual-signature-value {
                display: table-cell !important;
                width: 40% !important;
                vertical-align: middle !important;
                text-align: right !important;
                white-space: nowrap !important;
            }
          `,
        }}
      />
      <div className="casual-container w-full">
        <h3 className="casual-title">✨ 우리들의 챌린지 ✨</h3>

        <div className="casual-content space-y-6">
          <div>
            <p className="casual-heading">1. 무엇을 지킬건가요?</p>
            <p className="leading-relaxed text-base mb-4">
              {contractorName}은(는) {startDate}부터 {endDate}까지{" "}
              <span className="casual-highlight">
                '{formData.title || "[목표 제목]"}'
              </span>{" "}
              를 해야 합니다.
            </p>
          </div>

          <div>
            <p className="casual-heading">2. 인증은 어떻게 할건가요?</p>
            <p className="leading-relaxed text-base mb-4">
              기간동안 총{" "}
              <span className="casual-highlight">
                {formData.totalProof || "[횟수]"}
              </span>
              번은 채워야 합니다.
            </p>
          </div>

          <div>
            <p className="casual-heading">3. 챌린지 성공? 실패?</p>
            {(formData.reward || formData.penalty) && (
              <div className="space-y-3">
                {formData.reward && (
                  <p className="leading-relaxed text-base mb-2">
                    ⭕️ 성공 시:{" "}
                    <span className="casual-reward">{formData.reward}</span>
                  </p>
                )}
                {formData.penalty && (
                  <p className="leading-relaxed text-base">
                    ❌ 실패 시:{" "}
                    <span className="casual-penalty">{formData.penalty}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="casual-heading">4. 특별 규칙 !</p>
            <ul className="casual-list">
              <li className="casual-list-item">
                감시단 전원이 중도에 그만두면 → 도전자는 책임 면제
              </li>
              <li className="casual-list-item">
                내가 먼저 포기한다면 → 벌칙은 무조건 이행
              </li>
            </ul>
          </div>

          <div className="casual-signature">
            <p className="casual-center-text">
              위 내용 다 확인했고, 진심으로 지켜봅시다!
            </p>
            <div className="mt-4 space-y-3">
              {/* 계약자 서명 */}
              <div className="casual-signature-row">
                <span className="casual-signature-label">
                  <strong>도전자:</strong>
                </span>
                <span className="casual-signature-value">
                  {contractorName}
                  {formData.signatureImageKey || contractorSignatureKey ? (
                    contractorSignatureKey === "INVITATION_PREVIEW" ? (
                      <span className="text-[#2563eb] font-semibold text-sm">
                        서명 완료
                      </span>
                    ) : (
                      <img
                        src={
                          formData.signatureImageUrl ||
                          getImageUrl(
                            formData.signatureImageKey ||
                              contractorSignatureKey!
                          )
                        }
                        alt="user signature"
                        className="h-8 w-16 object-contain"
                      />
                    )
                  ) : (
                    <span className="text-[#6b7280]">(서명)</span>
                  )}
                </span>
              </div>

              {/* 감독자 서명 */}
              {supervisorSignatures.length > 0
                ? supervisorSignatures.map((sig, index) => (
                    <div key={index} className="casual-signature-row">
                      <span className="casual-signature-label">
                        <strong>감시단:</strong>
                      </span>
                      <span className="casual-signature-value">
                        {sig.name}
                        <img
                          src={getImageUrl(sig.signatureKey)}
                          alt="supervisor signature"
                          className="h-8 w-16 object-contain"
                        />
                      </span>
                    </div>
                  ))
                : supervisors.map((supervisor, index) => (
                    <div key={index} className="casual-signature-row">
                      <span className="casual-signature-label">
                        <strong>감시단:</strong>
                      </span>
                      <span className="casual-signature-value">
                        {supervisor.userName}
                        <span className="text-[#6b7280]">(서명)</span>
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StudentPreview: React.FC<{
  formData: FormData;
  participants?: ParticipantSimpleResponse[];
  contractorSignatureKey?: string;
  supervisorSignatures?: Array<{ name: string; signatureKey: string }>;
}> = ({
  formData,
  participants = [],
  contractorSignatureKey,
  supervisorSignatures = [],
}) => {
  const startDate = formData.startDate
    ? new Date(formData.startDate).toLocaleDateString("ko-KR")
    : "[시작일]";
  const endDate = formData.endDate
    ? new Date(formData.endDate).toLocaleDateString("ko-KR")
    : "[종료일]";

  const contractor = participants.find((p) => p.role === "CONTRACTOR");
  const supervisors = participants.filter(
    (p) => p.role === "SUPERVISOR" && p.valid
  );

  const finalChallenger = "[챌린저]"; // Placeholder
  const finalGoal = formData.title || "[도전 목표]";
  const benefits = formData.reward
    ? formData.reward.split(",").map((s) => s.trim())
    : [];
  const penalties = formData.penalty
    ? formData.penalty.split(",").map((s) => s.trim())
    : [];
  const totalSessions = formData.totalProof || "[횟수]";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
            @font-face {
                font-family: 'SangSangYoungestDaughter';
                src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2202@1.0/SangSangYoungestDaughter.woff') format('woff');
                font-weight: normal;
                font-style: normal;
            }
            .child-container, .child-container * { 
                font-family: 'SangSangYoungestDaughter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
            }
            .child-container {
                background-color: #ffffff !important;
                border: 4px dashed #60a5fa !important;
                border-radius: 16px !important;
                padding: 2rem !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                max-width: 28rem !important;
                margin: 0 auto !important;
            }
            .child-title {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                text-align: center !important;
                margin-bottom: 1.5rem !important;
                color: #374151 !important;
            }
            .child-content {
                font-size: 1.125rem !important;
                line-height: 1.6 !important;
                color: #374151 !important;
            }
            .child-heading {
                font-weight: 700 !important;
                font-size: 1.25rem !important;
                margin-bottom: 0.75rem !important;
                color: #374151 !important;
                text-align: left !important;
                display: block !important;
            }
            .child-list {
                list-style-type: disc !important;
                padding-left: 1.5rem !important;
                margin: 0.5rem 0 !important;
            }
            .child-list-item {
                margin-bottom: 0.25rem !important;
                line-height: 1.6 !important;
            }
            .child-center-text {
                text-align: center !important;
                display: block !important;
                margin: 1.5rem 0 !important;
            }
            .child-highlight {
                font-weight: 700 !important;
                color: #2563eb !important;
            }
            .child-reward {
                font-weight: 700 !important;
                color: #16a34a !important;
            }
            .child-penalty {
                font-weight: 700 !important;
                color: #dc2626 !important;
            }
            .child-signature {
                margin-top: 1.5rem !important;
                padding-top: 1rem !important;
                border-top: 1px solid #e5e7eb !important;
                text-align: center !important;
                font-size: 1rem !important;
                color: #6b7280 !important;
            }
            .child-signature-row {
                display: table !important;
                width: 100% !important;
                margin-bottom: 0.75rem !important;
                table-layout: fixed !important;
            }
            .child-signature-label {
                display: table-cell !important;
                width: 60% !important;
                vertical-align: middle !important;
                text-align: left !important;
                padding-right: 1rem !important;
            }
            .child-signature-value {
                display: table-cell !important;
                width: 40% !important;
                vertical-align: middle !important;
                text-align: right !important;
                white-space: nowrap !important;
            }
          `,
        }}
      />
      <div className="child-container w-full">
        <h2 className="child-title">😎 걍 폼 미쳤다 챌린지 간다ㅋㅋ 😎</h2>
        <div className="child-content space-y-6">
          <div>
            <h3 className="child-heading">1. 머선 약속?</h3>
            <p className="mt-2 text-lg mb-4 leading-relaxed">
              나{" "}
              <span className="child-highlight">
                {contractor?.userName || "[계약자명]"}
              </span>
              , {startDate}부터 {endDate}까지 '{formData.title || "[목표 제목]"}
              ' 이거 ㅇ ㄱ ㄹ ㅇ ㅂ ㅂ ㅂ ㄱ 걍 조진다.
            </p>
          </div>
          <div>
            <h3 className="child-heading">2. 인증 어케 할 건데?</h3>
            <p className="mt-2 text-lg mb-4 leading-relaxed">
              니가 정한 기간 안에 총{" "}
              <span className="child-highlight">{totalSessions}</span>번 해야함.
              못 채우면 알지?
            </p>
          </div>
          <div>
            <h3 className="child-heading">3. 성공 vs 실패</h3>
            {(benefits.length > 0 || penalties.length > 0) && (
              <>
                {benefits.length > 0 && (
                  <div className="mt-2">
                    <p className="text-lg mb-2 leading-relaxed">
                      🎁 성공하면? 레게노 찍고 상 받음 ㅋㅋ
                    </p>
                    <ul className="basic-reward-list">
                      {benefits.map((c, i) => (
                        <li
                          key={`s-${i}`}
                          className="basic-list-item child-reward"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {penalties.length > 0 && (
                  <div className="mt-3">
                    <p className="text-lg mb-2 leading-relaxed">
                      🕳️ 실패하면? 걍 나락가는 거임...
                    </p>
                    <ul className="basic-penalty-list">
                      {penalties.map((c, i) => (
                        <li
                          key={`f-${i}`}
                          className="basic-list-item child-penalty"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <h3 className="child-heading">4. 특별 규칙 (치트키 ㅇㅈ?)</h3>
            <ul className="child-list">
              <li className="child-list-item">
                니네가 다 튀면 책임 면제~ 완전 개꿀ㅋ
              </li>
              <li className="child-list-item">
                근데 내가 빤쓰런하면? 그땐 얄짤없이 벌칙 드가는 거 ㅇㅈ?
              </li>
            </ul>
          </div>

          <div className="child-signature">
            <p className="child-center-text">
              위 내용 다 읽음. 안 지키면 내가 사람이 아님. 어쩔티비 저쩔티비~
            </p>
            <div className="mt-4 space-y-3">
              {/* 계약자 서명 */}
              <div className="child-signature-row">
                <span className="child-signature-label">
                  <strong>챌린저:</strong>
                </span>
                <span className="child-signature-value">
                  {contractor?.userName || "[계약자명]"}
                  {formData.signatureImageKey || contractorSignatureKey ? (
                    contractorSignatureKey === "INVITATION_PREVIEW" ? (
                      <span className="text-[#2563eb] font-semibold text-sm">
                        서명 완료
                      </span>
                    ) : (
                      <img
                        src={
                          formData.signatureImageUrl ||
                          getImageUrl(
                            formData.signatureImageKey ||
                              contractorSignatureKey!
                          )
                        }
                        alt="user signature"
                        className="h-8 w-16 object-contain"
                      />
                    )
                  ) : (
                    <span className="text-[#6b7280]">(싸인)</span>
                  )}
                </span>
              </div>

              {/* 감독자 서명 */}
              {supervisorSignatures.length > 0
                ? supervisorSignatures.map((sig, index) => (
                    <div key={index} className="child-signature-row">
                      <span className="child-signature-label">
                        <strong>감시단:</strong>
                      </span>
                      <span className="child-signature-value">
                        {sig.name}
                        <img
                          src={getImageUrl(sig.signatureKey)}
                          alt="supervisor signature"
                          className="h-8 w-16 object-contain"
                        />
                      </span>
                    </div>
                  ))
                : supervisors.map((supervisor, index) => (
                    <div key={index} className="child-signature-row">
                      <span className="child-signature-label">
                        <strong>감시단:</strong>
                      </span>
                      <span className="child-signature-value">
                        {supervisor.userName}
                        <span className="text-[#6b7280]">(싸인)</span>
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ChildPreview: React.FC<{
  formData: FormData;
  participants?: ParticipantSimpleResponse[];
  contractorSignatureKey?: string;
  supervisorSignatures?: Array<{ name: string; signatureKey: string }>;
}> = ({
  formData,
  participants = [],
  contractorSignatureKey,
  supervisorSignatures = [],
}) => {
  const startDate = formData.startDate
    ? new Date(formData.startDate).toLocaleDateString("ko-KR")
    : "[시작일]";
  const endDate = formData.endDate
    ? new Date(formData.endDate).toLocaleDateString("ko-KR")
    : "[종료일]";

  const contractor = participants.find((p) => p.role === "CONTRACTOR");
  const supervisors = participants.filter(
    (p) => p.role === "SUPERVISOR" && p.valid
  );

  const benefits = formData.reward
    ? formData.reward.split(",").map((s) => s.trim())
    : [];
  const penalties = formData.penalty
    ? formData.penalty.split(",").map((s) => s.trim())
    : [];
  const totalSessions = formData.totalProof || "[횟수]";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
            @font-face {
                font-family: 'YoonChildfundkoreaManSeh';
                src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408@1.0/YoonChildfundkoreaManSeh.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            .baby-container, .baby-container * { 
                font-family: 'YoonChildfundkoreaManSeh', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
            }
            .baby-container {
                background-color: #ffffff !important;
                border: 4px solid #fbbf24 !important;
                border-radius: 16px !important;
                padding: 2rem !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                max-width: 28rem !important;
                margin: 0 auto !important;
            }
            .baby-title {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                text-align: center !important;
                margin-bottom: 1.5rem !important;
                color: #374151 !important;
            }
            .baby-content {
                font-size: 1.125rem !important;
                line-height: 1.6 !important;
                color: #374151 !important;
            }
            .baby-heading {
                font-weight: 700 !important;
                font-size: 1.25rem !important;
                margin-bottom: 0.75rem !important;
                color: #374151 !important;
                text-align: left !important;
                display: block !important;
                border-bottom: 2px dashed #fbbf24 !important;
                padding-bottom: 0.5rem !important;
            }
            .baby-list {
                list-style-type: none !important;
                padding-left: 0.5rem !important;
                margin: 0.5rem 0 !important;
            }
            .baby-list-item {
                margin-bottom: 0.5rem !important;
                line-height: 1.6 !important;
                color: #ea580c !important;
            }
            .baby-center-text {
                text-align: center !important;
                display: block !important;
                margin: 1.5rem 0 !important;
                font-size: 0.875rem !important;
                color: #6b7280 !important;
            }
            .baby-highlight {
                font-weight: 700 !important;
                color: #2563eb !important;
            }
            .baby-reward {
                font-weight: 700 !important;
                color: #16a34a !important;
            }
            .baby-penalty {
                font-weight: 700 !important;
                color: #dc2626 !important;
            }
            .baby-signature {
                margin-top: 1.5rem !important;
                padding-top: 1rem !important;
                border-top: 1px solid #e5e7eb !important;
                text-align: center !important;
                font-size: 0.875rem !important;
                color: #6b7280 !important;
            }
            .baby-signature-row {
                display: table !important;
                width: 100% !important;
                margin-bottom: 0.75rem !important;
                table-layout: fixed !important;
            }
            .baby-signature-label {
                display: table-cell !important;
                width: 60% !important;
                vertical-align: middle !important;
                text-align: left !important;
                padding-right: 1rem !important;
            }
            .baby-signature-value {
                display: table-cell !important;
                width: 40% !important;
                vertical-align: middle !important;
                text-align: right !important;
                white-space: nowrap !important;
            }
          `,
        }}
      />
      <div className="baby-container w-full">
        <h2 className="baby-title">🤙 우리의 약속 🤙</h2>
        <div className="baby-content space-y-6">
          <div>
            <h3 className="baby-heading">1. 무엇을 약속하나요?</h3>
            <p className="mt-2 text-lg mb-4 leading-relaxed">
              나,{" "}
              <span className="baby-highlight">
                {contractor?.userName || "[계약자명]"}
              </span>
              는(은) {startDate}부터 {endDate}까지{" "}
              <span className="baby-highlight">
                {formData.title || "[목표 제목]"}
              </span>{" "}
              꼭 할 거예요!
            </p>
          </div>
          <div>
            <h3 className="baby-heading">2. 어떻게 지킬 건가요?</h3>
            <p className="mt-2 text-lg mb-4 leading-relaxed">
              전부 <span className="baby-highlight">{totalSessions}</span>번을
              해야 해요!
            </p>
          </div>
          <div>
            <h3 className="baby-heading">3. 잘 지키면? 못 지키면?</h3>
            {(benefits.length > 0 || penalties.length > 0) && (
              <>
                {benefits.length > 0 && (
                  <div className="mt-2">
                    <p className="text-lg mb-2 leading-relaxed">
                      🎉 약속을 잘 지키면:
                    </p>
                    <ul className="baby-list">
                      {benefits.map((c, i) => (
                        <li key={`s-${i}`} className="baby-list-item">
                          - <span className="baby-reward">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {penalties.length > 0 && (
                  <div className="mt-3">
                    <p className="text-lg mb-2 leading-relaxed">
                      😥 약속을 못 지키면:
                    </p>
                    <ul className="baby-list">
                      {penalties.map((c, i) => (
                        <li key={`f-${i}`} className="baby-list-item">
                          - <span className="baby-penalty">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <h3 className="baby-heading">4. 특별한 규칙!</h3>
            <ul className="baby-list">
              <li className="baby-list-item">
                - 지켜보는 친구들이 모두 <strong>그만 본다고 하면</strong>,
                약속을 못 지켜도 <strong>벌칙을 받지 않아요</strong>.
              </li>
              <li className="baby-list-item">
                - 내가 먼저 <strong>그만둔다고 하면</strong>, 약속을 못 지켰을
                때 하기로 한 <strong>벌칙을 수행해야 해요</strong>.
              </li>
            </ul>
          </div>

          <div className="baby-signature">
            <p className="baby-center-text">
              위에 쓴 내용을 다 읽었고, 꼭꼭 지킬 것을 약속해요!
            </p>
            <div className="mt-4 space-y-3">
              {/* 계약자 서명 */}
              <div className="baby-signature-row">
                <span className="baby-signature-label">
                  <strong>약속하는 사람:</strong>
                </span>
                <span className="baby-signature-value">
                  {contractor?.userName || "[계약자명]"}
                  {formData.signatureImageKey || contractorSignatureKey ? (
                    contractorSignatureKey === "INVITATION_PREVIEW" ? (
                      <span className="text-[#2563eb] font-semibold text-sm">
                        서명 완료
                      </span>
                    ) : (
                      <img
                        src={
                          formData.signatureImageUrl ||
                          getImageUrl(
                            formData.signatureImageKey ||
                              contractorSignatureKey!
                          )
                        }
                        alt="user signature"
                        className="h-8 w-16 object-contain"
                      />
                    )
                  ) : (
                    <span className="text-[#6b7280]">(싸인)</span>
                  )}
                </span>
              </div>

              {/* 감독자 서명 */}
              {supervisorSignatures.length > 0
                ? supervisorSignatures.map((sig, index) => (
                    <div key={index} className="baby-signature-row">
                      <span className="baby-signature-label">
                        <strong>지켜보는 친구들:</strong>
                      </span>
                      <span className="baby-signature-value">
                        {sig.name}
                        <img
                          src={getImageUrl(sig.signatureKey)}
                          alt="supervisor signature"
                          className="h-8 w-16 object-contain"
                        />
                      </span>
                    </div>
                  ))
                : supervisors.map((supervisor, index) => (
                    <div key={index} className="baby-signature-row">
                      <span className="baby-signature-label">
                        <strong>지켜보는 친구들:</strong>
                      </span>
                      <span className="baby-signature-value">
                        {supervisor.userName}
                        <span className="text-[#6b7280]">(싸인)</span>
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const templates: Template[] = [
  {
    id: "BASIC",
    name: "어른 ver",
    description: "가장 표준적인 형태의 계약서",
    icon: "📋",
    previewComponent: BasicPreview,
  },
  {
    id: "JOSEON",
    name: "무협 ver",
    description: "강호의 도의를 지키기 위한 계약서",
    icon: "⚖️",
    previewComponent: JoseonPreview,
  },
  {
    id: "CASUAL",
    name: "캐주얼 ver",
    description: "우리들의 챌린지",
    icon: "✨",
    previewComponent: CasualPreview,
  },

  {
    id: "STUDENT",
    name: "초딩 ver",
    description: "걍 폼 미쳤다",
    icon: "🎨",
    previewComponent: StudentPreview,
  },
  {
    id: "CHILD",
    name: "애기 ver",
    description: "우리의 약속",
    icon: "🤙",
    previewComponent: ChildPreview,
  },
];

export default function TemplateStep({
  setFormData,
  onNext,
  onCancel,
  formData,
}: StepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    () => templates.find((t) => t.id === formData.templateId) || templates[0]
  );
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(() => {
    const index = templates.findIndex((t) => t.id === formData.templateId);
    return index >= 0 ? index : 0;
  });

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({ ...prev, templateId: template.id }));
  };

  const handleNextTemplate = () => {
    const nextIndex = (currentTemplateIndex + 1) % templates.length;
    setCurrentTemplateIndex(nextIndex);
    handleSelectTemplate(templates[nextIndex]);
  };

  const handlePrevTemplate = () => {
    const prevIndex =
      (currentTemplateIndex - 1 + templates.length) % templates.length;
    setCurrentTemplateIndex(prevIndex);
    handleSelectTemplate(templates[prevIndex]);
  };

  const PreviewComponent = selectedTemplate.previewComponent;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#374151]">
          계약서 템플릿 선택
        </h2>
        <p className="text-base text-[#6b7280]">
          예시를 참고하여 원하는 계약서 형식을 선택해주세요
        </p>
      </div>

      {/* 템플릿 선택기 */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={handlePrevTemplate}
          className="p-2 rounded-full hover:bg-[#f3f4f6] text-[#6b7280] transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <span className="text-xl font-bold text-[#374151] mx-6 w-32 text-center">
          {selectedTemplate.name}
        </span>
        <button
          onClick={handleNextTemplate}
          className="p-2 rounded-full hover:bg-[#f3f4f6] text-[#6b7280] transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* 미리보기 */}
      <div className="mt-6">
        <PreviewComponent
          formData={formData}
          participants={[]}
          contractorSignatureKey={undefined}
          supervisorSignatures={[]}
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-between mt-8">
        <Button onClick={onCancel} variant="outline" className="flex-1 mr-3">
          취소
        </Button>
        <Button
          onClick={onNext}
          className="w-full bg-[#1f2937] text-white font-bold py-3.5 px-4 rounded-xl hover:opacity-90 transition-opacity flex-1 ml-3"
        >
          다음으로
        </Button>
      </div>
    </div>
  );
}
