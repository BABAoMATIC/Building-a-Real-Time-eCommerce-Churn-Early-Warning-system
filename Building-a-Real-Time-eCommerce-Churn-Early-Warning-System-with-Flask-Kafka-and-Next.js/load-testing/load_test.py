#!/usr/bin/env python3
"""
Load Testing Script for Flask /predict-churn API

This script simulates 100 concurrent users making requests to the Flask API
with randomized event types and measures response times and throughput.
"""

import asyncio
import aiohttp
import json
import random
import time
import statistics
from datetime import datetime
from typing import List, Dict, Any
import argparse

class LoadTester:
    """Load testing class for the churn prediction API"""
    
    def __init__(self, base_url: str = "http://localhost:5000", concurrent_users: int = 100):
        self.base_url = base_url
        self.concurrent_users = concurrent_users
        self.results = []
        self.start_time = None
        self.end_time = None
        
        # Event types to randomize
        self.event_types = [
            "add_to_cart", "product_view", "bounce", "checkout",
            "login", "logout", "signup", "purchase", "search",
            "page_view", "category_view", "wishlist_add", "review_submit"
        ]
        
        # Pages for metadata
        self.pages = [
            "/home", "/products", "/product-detail", "/cart", "/checkout",
            "/profile", "/orders", "/search", "/category", "/about"
        ]
        
        # Devices for metadata
        self.devices = ["desktop", "mobile", "tablet"]
        
        # Referrers for metadata
        self.referrers = ["google", "facebook", "direct", "email", "social", "organic"]
    
    def generate_random_user_data(self) -> Dict[str, Any]:
        """Generate random user data for testing"""
        user_id = f"user_{random.randint(1, 1000)}"
        event_type = random.choice(self.event_types)
        timestamp = datetime.now().isoformat()
        
        # Generate metadata based on event type
        metadata = {
            "page": random.choice(self.pages),
            "device": random.choice(self.devices),
            "referrer": random.choice(self.referrers),
            "session_length": round(random.uniform(1, 30), 2)
        }
        
        # Add event-specific metadata
        if event_type == "add_to_cart":
            metadata.update({
                "product_id": f"PROD-{random.randint(1, 1000):03d}",
                "quantity": random.randint(1, 5),
                "price": round(random.uniform(10, 200), 2)
            })
        elif event_type == "product_view":
            metadata.update({
                "product_id": f"PROD-{random.randint(1, 1000):03d}",
                "category": random.choice(["electronics", "clothing", "books", "home", "sports"]),
                "view_duration": round(random.uniform(5, 120), 2)
            })
        elif event_type == "bounce":
            metadata["session_length"] = round(random.uniform(0.1, 5), 2)
        elif event_type == "purchase":
            metadata.update({
                "order_id": f"ORDER-{random.randint(1, 10000):04d}",
                "total_amount": round(random.uniform(20, 500), 2),
                "payment_method": random.choice(["credit_card", "paypal", "apple_pay", "google_pay"])
            })
        elif event_type == "search":
            metadata.update({
                "search_term": random.choice(["laptop", "phone", "book", "shirt", "shoes"]),
                "results_count": random.randint(1, 100)
            })
        
        return {
            "user_id": user_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "metadata": metadata
        }
    
    async def make_request(self, session: aiohttp.ClientSession, request_id: int) -> Dict[str, Any]:
        """Make a single request to the API"""
        start_time = time.time()
        
        try:
            # Generate random data
            data = self.generate_random_user_data()
            
            # Make request
            async with session.post(
                f"{self.base_url}/predict-churn",
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
                
                # Read response
                response_data = await response.json()
                
                # Validate response
                is_valid = (
                    response.status == 200 and
                    "churn_score" in response_data and
                    isinstance(response_data["churn_score"], (int, float)) and
                    0 <= response_data["churn_score"] <= 1
                )
                
                # Check if churn score matches expected logic
                expected_score = 0.9 if data["event_type"] == "bounce" else 0.2
                score_correct = abs(response_data.get("churn_score", 0) - expected_score) < 0.001
                
                result = {
                    "request_id": request_id,
                    "user_id": data["user_id"],
                    "event_type": data["event_type"],
                    "status_code": response.status,
                    "response_time_ms": round(response_time, 2),
                    "churn_score": response_data.get("churn_score"),
                    "is_valid": is_valid,
                    "score_correct": score_correct,
                    "timestamp": datetime.now().isoformat(),
                    "error": None
                }
                
                return result
                
        except asyncio.TimeoutError:
            response_time = (time.time() - start_time) * 1000
            return {
                "request_id": request_id,
                "user_id": "unknown",
                "event_type": "unknown",
                "status_code": 0,
                "response_time_ms": round(response_time, 2),
                "churn_score": None,
                "is_valid": False,
                "score_correct": False,
                "timestamp": datetime.now().isoformat(),
                "error": "Timeout"
            }
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return {
                "request_id": request_id,
                "user_id": "unknown",
                "event_type": "unknown",
                "status_code": 0,
                "response_time_ms": round(response_time, 2),
                "churn_score": None,
                "is_valid": False,
                "score_correct": False,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    async def run_load_test(self, duration_seconds: int = 60) -> None:
        """Run the load test for specified duration"""
        print(f"🚀 Starting load test with {self.concurrent_users} concurrent users")
        print(f"⏱️  Duration: {duration_seconds} seconds")
        print(f"🎯 Target: {self.base_url}/predict-churn")
        print("-" * 60)
        
        self.start_time = time.time()
        self.end_time = self.start_time + duration_seconds
        
        # Create semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(self.concurrent_users)
        
        async def limited_request(session: aiohttp.ClientSession, request_id: int):
            async with semaphore:
                return await self.make_request(session, request_id)
        
        # Create HTTP session with connection pooling
        connector = aiohttp.TCPConnector(limit=200, limit_per_host=200)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            request_id = 0
            tasks = []
            
            # Start initial batch of requests
            while time.time() < self.end_time:
                # Create new tasks up to the concurrent limit
                while len(tasks) < self.concurrent_users and time.time() < self.end_time:
                    task = asyncio.create_task(limited_request(session, request_id))
                    tasks.append(task)
                    request_id += 1
                
                # Wait for some tasks to complete
                if tasks:
                    done, tasks = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
                    
                    # Process completed tasks
                    for task in done:
                        result = await task
                        self.results.append(result)
                        
                        # Print progress
                        if len(self.results) % 100 == 0:
                            elapsed = time.time() - self.start_time
                            rate = len(self.results) / elapsed
                            print(f"📊 Completed {len(self.results)} requests in {elapsed:.1f}s (Rate: {rate:.1f} req/s)")
                
                # Small delay to prevent overwhelming the server
                await asyncio.sleep(0.01)
            
            # Wait for remaining tasks
            if tasks:
                remaining_results = await asyncio.gather(*tasks, return_exceptions=True)
                for result in remaining_results:
                    if isinstance(result, dict):
                        self.results.append(result)
    
    def print_results(self) -> None:
        """Print detailed test results"""
        if not self.results:
            print("❌ No results to display")
            return
        
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r["status_code"] == 200)
        failed_requests = total_requests - successful_requests
        
        # Calculate response times
        response_times = [r["response_time_ms"] for r in self.results if r["response_time_ms"] > 0]
        
        # Calculate throughput
        total_duration = time.time() - self.start_time if self.start_time else 1
        requests_per_second = total_requests / total_duration
        
        # Calculate churn score accuracy
        correct_scores = sum(1 for r in self.results if r.get("score_correct", False))
        score_accuracy = (correct_scores / total_requests) * 100 if total_requests > 0 else 0
        
        # Event type distribution
        event_counts = {}
        for result in self.results:
            event_type = result.get("event_type", "unknown")
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        print("\n" + "=" * 60)
        print("📊 LOAD TEST RESULTS")
        print("=" * 60)
        
        print(f"⏱️  Total Duration: {total_duration:.2f} seconds")
        print(f"📈 Total Requests: {total_requests}")
        print(f"✅ Successful Requests: {successful_requests}")
        print(f"❌ Failed Requests: {failed_requests}")
        print(f"📊 Success Rate: {(successful_requests/total_requests)*100:.2f}%")
        print(f"🚀 Requests/Second: {requests_per_second:.2f}")
        print(f"🎯 Score Accuracy: {score_accuracy:.2f}%")
        
        if response_times:
            print(f"\n⏱️  RESPONSE TIME STATISTICS")
            print(f"   Average: {statistics.mean(response_times):.2f} ms")
            print(f"   Median: {statistics.median(response_times):.2f} ms")
            print(f"   Min: {min(response_times):.2f} ms")
            print(f"   Max: {max(response_times):.2f} ms")
            print(f"   95th Percentile: {sorted(response_times)[int(len(response_times)*0.95)]:.2f} ms")
            print(f"   99th Percentile: {sorted(response_times)[int(len(response_times)*0.99)]:.2f} ms")
        
        print(f"\n📋 EVENT TYPE DISTRIBUTION")
        for event_type, count in sorted(event_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total_requests) * 100
            print(f"   {event_type}: {count} ({percentage:.1f}%)")
        
        # Error analysis
        errors = [r for r in self.results if r.get("error")]
        if errors:
            print(f"\n❌ ERROR ANALYSIS")
            error_counts = {}
            for error in errors:
                error_type = error.get("error", "Unknown")
                error_counts[error_type] = error_counts.get(error_type, 0) + 1
            
            for error_type, count in error_counts.items():
                print(f"   {error_type}: {count}")
        
        print("\n" + "=" * 60)
    
    def save_results_to_file(self, filename: str = None) -> None:
        """Save results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"load_test_results_{timestamp}.json"
        
        results_data = {
            "test_config": {
                "base_url": self.base_url,
                "concurrent_users": self.concurrent_users,
                "start_time": self.start_time,
                "end_time": self.end_time,
                "total_duration": time.time() - self.start_time if self.start_time else 0
            },
            "results": self.results
        }
        
        with open(filename, 'w') as f:
            json.dump(results_data, f, indent=2)
        
        print(f"💾 Results saved to: {filename}")


async def main():
    """Main function to run the load test"""
    parser = argparse.ArgumentParser(description="Load test the Flask /predict-churn API")
    parser.add_argument("--url", default="http://localhost:5000", help="Base URL of the API")
    parser.add_argument("--users", type=int, default=100, help="Number of concurrent users")
    parser.add_argument("--duration", type=int, default=60, help="Test duration in seconds")
    parser.add_argument("--output", help="Output file for results")
    
    args = parser.parse_args()
    
    # Create and run load tester
    tester = LoadTester(base_url=args.url, concurrent_users=args.users)
    
    try:
        await tester.run_load_test(duration_seconds=args.duration)
        tester.print_results()
        
        if args.output:
            tester.save_results_to_file(args.output)
        
    except KeyboardInterrupt:
        print("\n⏹️  Load test interrupted by user")
        tester.print_results()
    except Exception as e:
        print(f"❌ Error during load test: {e}")
        tester.print_results()


if __name__ == "__main__":
    asyncio.run(main())
