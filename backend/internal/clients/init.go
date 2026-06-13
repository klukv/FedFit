package clients

import "os"

type Clients struct {
	RecommendationClient *RecommendationClient
}

func InitClients() *Clients {
	baseURL := os.Getenv("RECOMM_SYSTEM_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8001"
	}

	recommClient := NewRecommendationClient(baseURL)

	return &Clients{
		RecommendationClient: recommClient,
	}
}
