package clients

type Clients struct {
	RecommendationClient *RecommendationClient
}

func InitClients() *Clients {
	recommClient := NewRecommendationClient("http://localhost:8001")

	return &Clients{
		RecommendationClient: recommClient,
	}
}
