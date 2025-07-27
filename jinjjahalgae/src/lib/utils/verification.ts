import { isoStringToKoreanDateString } from "@/lib/utils/date";

/**
 * 인증 리스트를 getProof fetcher와 함께 받아, createdAt 기준으로 날짜별로 매핑
 * @param proofs API에서 받은 인증 리스트
 * @param getProof 인증 상세 fetch 함수 (proofId:number)=>Promise<any>
 * @param convertToItem proof → VerificationItem 변환 함수
 * @returns Promise<{ [date: string]: VerificationItem[] }>
 */
export async function getProofListWithCreatedAtMap(proofs: any[], getProof: (proofId: number) => Promise<any>, convertToItem: (proof: any) => any[]) {
  const verificationsMap: { [date: string]: any[] } = {};
  for (const proof of proofs) {
    const items = convertToItem(proof);
    for (const item of items) {
      if (item.proofId) {
        try {
          const proofDetail = await getProof(item.proofId);
          const detail = proofDetail.result;
          // createdAt 기준 날짜
          if (detail && detail.createdAt) {
            item.date = isoStringToKoreanDateString(detail.createdAt);
            item.createdAt = detail.createdAt;
          }
          // comment(설명)도 detail에서 가져와서 description에 할당
          if (detail && detail.comment) {
            item.description = detail.comment;
          }
        } catch (e) {
          // fallback: proof.date 사용
          if (!item.date && proof.date) {
            item.date = isoStringToKoreanDateString(proof.date);
          }
        }
        if (item.date) {
          if (!verificationsMap[item.date]) verificationsMap[item.date] = [];
          verificationsMap[item.date].push(item);
        }
      }
    }
  }
  return verificationsMap;
}

// VerificationItem 타입은 각 페이지에서 import 하거나, 필요시 여기에 선언/공통화 