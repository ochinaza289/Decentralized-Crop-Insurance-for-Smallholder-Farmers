;; weather-oracle.clar
;; Provides verified climate information

(define-constant contract-owner tx-sender)

(define-map authorized-data-providers principal bool)

(define-map weather-data
  { location: (string-utf8 100), timestamp: uint }
  {
    temperature: int,
    rainfall: uint,
    humidity: uint,
    wind-speed: uint,
    reported-by: principal
  }
)

(define-map weather-events
  { location: (string-utf8 100), event-id: uint }
  {
    event-type: (string-utf8 50),
    severity: uint,
    start-time: uint,
    end-time: uint,
    confirmed: bool
  }
)

(define-data-var last-event-id uint u0)

;; Only contract owner can authorize data providers
(define-public (authorize-provider (provider principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u403))
    (ok (map-set authorized-data-providers provider true))
  )
)

;; Only authorized providers can submit weather data
(define-public (submit-weather-data
    (location (string-utf8 100))
    (temperature int)
    (rainfall uint)
    (humidity uint)
    (wind-speed uint))
  (begin
    (asserts! (default-to false (map-get? authorized-data-providers tx-sender)) (err u403))
    (ok (map-set weather-data
      { location: location, timestamp: block-height }
      {
        temperature: temperature,
        rainfall: rainfall,
        humidity: humidity,
        wind-speed: wind-speed,
        reported-by: tx-sender
      }
    ))
  )
)

;; Report a weather event
(define-public (report-weather-event
    (location (string-utf8 100))
    (event-type (string-utf8 50))
    (severity uint)
    (start-time uint)
    (end-time uint))
  (let ((event-id (+ (var-get last-event-id) u1)))
    (asserts! (default-to false (map-get? authorized-data-providers tx-sender)) (err u403))
    (var-set last-event-id event-id)
    (ok (map-set weather-events
      { location: location, event-id: event-id }
      {
        event-type: event-type,
        severity: severity,
        start-time: start-time,
        end-time: end-time,
        confirmed: false
      }
    ))
  )
)

;; Confirm a weather event (requires multiple confirmations in a real system)
(define-public (confirm-weather-event (location (string-utf8 100)) (event-id uint))
  (let ((event (unwrap! (map-get? weather-events { location: location, event-id: event-id }) (err u404))))
    (asserts! (default-to false (map-get? authorized-data-providers tx-sender)) (err u403))
    (ok (map-set weather-events
      { location: location, event-id: event-id }
      (merge event { confirmed: true })
    ))
  )
)

(define-read-only (get-weather-data (location (string-utf8 100)) (timestamp uint))
  (map-get? weather-data { location: location, timestamp: timestamp })
)

(define-read-only (get-weather-event (location (string-utf8 100)) (event-id uint))
  (map-get? weather-events { location: location, event-id: event-id })
)
