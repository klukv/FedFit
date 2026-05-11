package clients

import (
	"net/http"
	"time"
)

type RecommendationClient struct {
	baseUrl    string
	httpClient *http.Client
}

func NewRecommendationClient(baseUrl string) *RecommendationClient {
	return &RecommendationClient{baseUrl: baseUrl, httpClient: &http.Client{
		Timeout: 5 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:    100,
			IdleConnTimeout: 90 * time.Second,
		},
	}}
}

// func (c *RecommendationClient) GetRecommendationPlan(ctx context.Context, surveyResult models.SurveyResult) (string, error) {
// 	url := fmt.Sprintf("%s/recommend", c.baseUrl)

// 	dataBytes, err := json.Marshal(surveyResult)

// 	if err != nil {
// 		return "", fmt.Errorf("Ошибка сериализации тела запроса для получения рекомендаций")
// 	}

// 	dataBytesReader := bytes.NewReader(dataBytes)

// 	req, err := http.NewRequestWithContext(ctx, "POST", url, dataBytesReader)

// 	if err != nil {
// 		return "", fmt.Errorf("Ошибка запроса рекомендаций. Подробнее %s", err.Error())
// 	}

// 	res, err := c.httpClient.Do(req)

// 	if err != nil {
// 		return "", fmt.Errorf("Ошибка получения ответа рекомендаций. Подробнее %s", err.Error())
// 	}

// 	return res
// }
