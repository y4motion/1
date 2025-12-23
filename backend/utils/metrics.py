from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional
import asyncio


class PerformanceMetrics:
    """Track API performance metrics"""
    
    def __init__(self):
        self.endpoint_times: Dict[str, List[float]] = defaultdict(list)
        self.endpoint_counts: Dict[str, int] = defaultdict(int)
        self.error_counts: Dict[str, int] = defaultdict(int)
        self.start_time = datetime.utcnow()
    
    def record_request(self, endpoint: str, duration: float, status_code: int):
        """Record request metrics"""
        self.endpoint_times[endpoint].append(duration)
        self.endpoint_counts[endpoint] += 1
        
        if status_code >= 400:
            self.error_counts[endpoint] += 1
    
    def get_stats(self, endpoint: Optional[str] = None) -> dict:
        """Get performance statistics"""
        if endpoint:
            times = self.endpoint_times.get(endpoint, [])
            if not times:
                return {
                    'endpoint': endpoint,
                    'total_requests': 0,
                    'avg_duration': 0,
                    'error_count': 0
                }
            
            return {
                'endpoint': endpoint,
                'total_requests': self.endpoint_counts[endpoint],
                'avg_duration': round(sum(times) / len(times), 3),
                'min_duration': round(min(times), 3),
                'max_duration': round(max(times), 3),
                'p50': round(sorted(times)[len(times)//2], 3),
                'p95': round(sorted(times)[int(len(times)*0.95)], 3) if len(times) > 20 else round(max(times), 3),
                'error_count': self.error_counts[endpoint],
                'error_rate': round(self.error_counts[endpoint] / self.endpoint_counts[endpoint] * 100, 2)
            }
        else:
            # All endpoints summary
            all_stats = {
                ep: self.get_stats(ep)
                for ep in sorted(self.endpoint_counts.keys())
            }
            
            # Overall summary
            total_requests = sum(self.endpoint_counts.values())
            total_errors = sum(self.error_counts.values())
            all_times = [t for times in self.endpoint_times.values() for t in times]
            
            return {
                'summary': {
                    'total_requests': total_requests,
                    'total_errors': total_errors,
                    'overall_error_rate': round(total_errors / total_requests * 100, 2) if total_requests > 0 else 0,
                    'avg_response_time': round(sum(all_times) / len(all_times), 3) if all_times else 0,
                    'uptime_seconds': int((datetime.utcnow() - self.start_time).total_seconds()),
                    'endpoints_count': len(self.endpoint_counts)
                },
                'endpoints': all_stats
            }
    
    async def cleanup_old_data(self):
        """Cleanup old metrics periodically (keep last 1000 per endpoint)"""
        while True:
            await asyncio.sleep(3600)  # Every hour
            
            for endpoint in list(self.endpoint_times.keys()):
                if len(self.endpoint_times[endpoint]) > 1000:
                    # Keep only last 1000
                    self.endpoint_times[endpoint] = self.endpoint_times[endpoint][-1000:]
    
    def get_slow_endpoints(self, threshold: float = 1.0) -> List[dict]:
        """Get endpoints slower than threshold"""
        slow = []
        
        for endpoint, times in self.endpoint_times.items():
            avg = sum(times) / len(times) if times else 0
            if avg > threshold:
                slow.append({
                    'endpoint': endpoint,
                    'avg_duration': round(avg, 3),
                    'max_duration': round(max(times), 3),
                    'request_count': len(times)
                })
        
        return sorted(slow, key=lambda x: x['avg_duration'], reverse=True)


# Global metrics instance
metrics = PerformanceMetrics()
