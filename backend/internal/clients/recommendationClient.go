package clients

import (
	"FedFit/internal/models"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
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

func (c *RecommendationClient) GetRecommendationPlan(ctx context.Context, surveyResult models.SurveyResult) (*http.Response, error) {
	url := fmt.Sprintf("%s/recommend", c.baseUrl)

	dataBytes, err := json.Marshal(surveyResult)

	if err != nil {
		log.Printf("Ошибка сериализации тела запроса для получения рекомендаций: %s", err)
		return &http.Response{}, fmt.Errorf("Ошибка сериализации тела запроса для получения рекомендаций")
	}

	dataBytesReader := bytes.NewReader(dataBytes)

	req, err := http.NewRequestWithContext(ctx, "POST", url, dataBytesReader)

	if err != nil {
		log.Printf("Ошибка запроса рекомендаций: %s", err)
		return &http.Response{}, fmt.Errorf("Ошибка запроса рекомендаций")
	}

	res, err := c.httpClient.Do(req)

	if err != nil {
		log.Printf("Ошибка получения ответа рекомендаций: %s", err)
		return &http.Response{}, fmt.Errorf("Ошибка получения ответа рекомендаций")
	}

	return res, nil
}
