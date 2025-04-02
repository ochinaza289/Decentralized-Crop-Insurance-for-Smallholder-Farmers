;; premium-calculator.clar
;; Adjusts rates based on location and crop type

(define-constant contract-owner tx-sender)

;; Base rates per location (simplified)
(define-map location-risk-factors
  { location: (string-utf8 100) }
  { risk-factor: uint }
)

;; Risk factors per crop type
(define-map crop-risk-factors
  { crop-type: (string-utf8 50) }
  { risk-factor: uint }
)

;; Base premium rate in basis points (1/100 of a percent)
(define-data-var base-premium-rate uint u500) ;; 5%

;; Only contract owner can update risk factors
(define-public (set-location-risk-factor (location (string-utf8 100)) (risk-factor uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u403))
    (ok (map-set location-risk-factors
      { location: location }
      { risk-factor: risk-factor }
    ))
  )
)

(define-public (set-crop-risk-factor (crop-type (string-utf8 50)) (risk-factor uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u403))
    (ok (map-set crop-risk-factors
      { crop-type: crop-type }
      { risk-factor: risk-factor }
    ))
  )
)

(define-public (set-base-premium-rate (rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u403))
    (ok (var-set base-premium-rate rate))
  )
)

;; Calculate premium for a farmer
(define-read-only (calculate-premium
    (location (string-utf8 100))
    (crop-type (string-utf8 50))
    (coverage-amount uint))
  (let (
    (location-factor (default-to { risk-factor: u100 } (map-get? location-risk-factors { location: location })))
    (crop-factor (default-to { risk-factor: u100 } (map-get? crop-risk-factors { crop-type: crop-type })))
    (base-rate (var-get base-premium-rate))
  )
    ;; Formula: base-rate * location-risk * crop-risk * coverage-amount / 1000000
    ;; (dividing by 1000000 because we're multiplying percentages in basis points)
    (/ (* (* (* base-rate (get risk-factor location-factor)) (get risk-factor crop-factor)) coverage-amount) u1000000)
  )
)
