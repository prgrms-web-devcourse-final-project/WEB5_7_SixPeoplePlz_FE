/**
 * 파일 업로드 API 엔드포인트
 * - 서명 이미지를 S3에 업로드
 * - 다른 파일 타입도 지원 가능
 */

import { NextRequest, NextResponse } from "next/server";

// AWS SDK v3 import (실제 프로젝트에서는 설치 필요: npm install @aws-sdk/client-s3)
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 클라이언트 설정 (환경변수 사용)
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'ap-northeast-2',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일 유효성 검사
    if (type === "signature") {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "이미지 파일만 업로드 가능합니다." },
          { status: 400 }
        );
      }

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "파일 크기가 너무 큽니다. (최대 5MB)" },
          { status: 400 }
        );
      }
    }

    // 파일을 버퍼로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 고유한 파일명 생성
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split(".").pop() || "png";
    const fileName = `${type}/${timestamp}_${randomId}.${fileExtension}`;

    try {
      // S3 업로드 (실제 환경에서 사용)
      /*
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        // 서명 이미지는 공개 읽기 권한 설정
        ...(type === 'signature' && { ACL: 'public-read' }),
      });

      await s3Client.send(uploadCommand);

      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      */

      // 개발 환경용 - 로컬 저장 또는 임시 처리
      console.log("파일 업로드 시뮬레이션:", {
        fileName,
        size: file.size,
        type: file.type,
      });

      // 임시 URL 생성 (실제로는 S3 URL)
      const fileUrl = `https://temp-storage.example.com/${fileName}`;

      return NextResponse.json({
        success: true,
        key: fileName,
        url: fileUrl,
        size: file.size,
        contentType: file.type,
      });
    } catch (uploadError) {
      console.error("S3 업로드 오류:", uploadError);
      return NextResponse.json(
        { error: "파일 업로드에 실패했습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("업로드 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// GET 요청으로 업로드된 파일 정보 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "파일 키가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    // 실제 환경에서는 S3에서 파일 정보 조회
    // const headCommand = new HeadObjectCommand({
    //   Bucket: process.env.AWS_S3_BUCKET!,
    //   Key: key,
    // });
    // const result = await s3Client.send(headCommand);

    // 임시 응답
    return NextResponse.json({
      success: true,
      key,
      url: `https://temp-storage.example.com/${key}`,
      exists: true,
    });
  } catch (error) {
    console.error("파일 조회 오류:", error);
    return NextResponse.json(
      { error: "파일을 찾을 수 없습니다." },
      { status: 404 }
    );
  }
}
