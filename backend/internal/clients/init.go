package clients

type Clients struct {
	RecommendationClient *RecommendationClient
}

func InitClients(baseUrl string) *Clients {
	recommClient := newRecommendationClient(baseUrl)

	return &Clients{
		RecommendationClient: recommClient,
	}
}
