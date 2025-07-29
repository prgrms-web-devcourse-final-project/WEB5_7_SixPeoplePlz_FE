/**
 * API 호출 배칭 관리자
 * - 동일한 API 요청의 중복 호출 방지
 * - 요청 키 기반 배칭 처리
 * - Promise 기반 동시성 제어
 */

interface BatchRequest {
  key: string;
  promise: Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class ApiBatchManager {
  private static instance: ApiBatchManager | null = null;
  private batchMap = new Map<string, BatchRequest>();
  private readonly BATCH_TIMEOUT = 1000; // 1초
  private cleanupInterval: NodeJS.Timeout | null = null;

  // 싱글톤 패턴
  static getInstance(): ApiBatchManager {
    if (!ApiBatchManager.instance) {
      ApiBatchManager.instance = new ApiBatchManager();
      // 정기적인 정리 작업 시작
      ApiBatchManager.instance.startCleanupInterval();
    }
    return ApiBatchManager.instance;
  }

  /**
   * 정기적인 정리 작업 시작
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredRequests();
    }, 5000); // 5초마다 정리
  }

  /**
   * 배칭된 API 요청 실행
   * @param key 요청 키 (URL + 파라미터 기반)
   * @param requestFn 실제 API 요청 함수
   * @returns Promise<any>
   */
  async executeBatchRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // 이미 진행 중인 동일한 요청이 있는지 확인
    const existingRequest = this.batchMap.get(key);
    
    if (existingRequest) {
      return existingRequest.promise as Promise<T>;
    }

    // 새로운 요청 생성
    
    let resolve: (value: T) => void;
    let reject: (error: any) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const batchRequest: BatchRequest = {
      key,
      promise,
      resolve: resolve!,
      reject: reject!,
      timestamp: Date.now(),
    };

    this.batchMap.set(key, batchRequest);

    try {
      // 실제 API 요청 실행
      const result = await requestFn();
      
      // Response 객체인 경우 clone하여 반환
      if (result instanceof Response) {
        const clonedResponse = result.clone();
        batchRequest.resolve(clonedResponse);
      } else {
        batchRequest.resolve(result);
      }
      
    } catch (error) {
      batchRequest.reject(error);
      console.error(`❌ 배칭 요청 실패: ${key}`, error);
    } finally {
      // 요청 완료 후 맵에서 제거
      this.batchMap.delete(key);
    }

    return promise;
  }

  /**
   * 요청 키 생성 (URL + 파라미터 기반)
   */
  generateRequestKey(
    url: string,
    method: string = 'GET',
    body?: any,
    query?: any
  ): string {
    const keyParts = [method, url];
    
    if (query && Object.keys(query).length > 0) {
      const sortedQuery = Object.keys(query)
        .sort()
        .map(key => `${key}=${query[key]}`)
        .join('&');
      keyParts.push(sortedQuery);
    }
    
    if (body) {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      keyParts.push(bodyStr);
    }
    
    return keyParts.join('|');
  }

  /**
   * 만료된 요청 정리
   */
  private cleanupExpiredRequests(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, request] of this.batchMap.entries()) {
      if (now - request.timestamp > this.BATCH_TIMEOUT) {
        this.batchMap.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      // 정리 작업 완료 (로그 제거)
    }
  }

  /**
   * 현재 배칭 상태 조회
   */
  getBatchStatus(): { key: string; timestamp: number; age: number }[] {
    const now = Date.now();
    return Array.from(this.batchMap.entries()).map(([key, request]) => ({
      key,
      timestamp: request.timestamp,
      age: now - request.timestamp,
    }));
  }

  /**
   * 배칭 통계 조회
   */
  getBatchStats(): {
    activeRequests: number;
    oldestRequest: number;
    averageAge: number;
  } {
    const now = Date.now();
    const requests = Array.from(this.batchMap.values());
    
    if (requests.length === 0) {
      return {
        activeRequests: 0,
        oldestRequest: 0,
        averageAge: 0,
      };
    }
    
    const ages = requests.map(req => now - req.timestamp);
    const oldestRequest = Math.max(...ages);
    const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    
    return {
      activeRequests: requests.length,
      oldestRequest,
      averageAge: Math.round(averageAge),
    };
  }

  /**
   * 모든 배칭 요청 초기화
   */
  clearAllBatches(): void {
    this.batchMap.clear();
    // 모든 배칭 요청 초기화 완료 (로그 제거)
  }

  /**
   * 배칭 매니저 정리
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clearAllBatches();
  }
}

// 편의를 위한 기본 export
export const batchManager = ApiBatchManager.getInstance(); 