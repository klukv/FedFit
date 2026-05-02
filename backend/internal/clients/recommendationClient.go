package clients

import (
	"net/http"
	"time"
)

type RecommendationClient struct {
	baseUrl    string
	httpClient *http.Client
}

func newRecommendationClient(baseUrl string) *RecommendationClient {
	return &RecommendationClient{baseUrl: baseUrl, httpClient: &http.Client{
		Timeout: 5 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:    100,
			IdleConnTimeout: 90 * time.Second,
		},
	}}
}
