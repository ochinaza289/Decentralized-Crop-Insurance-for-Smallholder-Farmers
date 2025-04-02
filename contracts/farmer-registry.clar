;; farmer-registry.clar
;; Records details of small agricultural operations

(define-data-var last-farmer-id uint u0)

(define-map farmers
  { farmer-id: uint }
  {
    name: (string-utf8 100),
    location: (string-utf8 100),
    crop-type: (string-utf8 50),
    farm-size: uint,
    registered-at: uint
  }
)

(define-public (register-farmer
    (name (string-utf8 100))
    (location (string-utf8 100))
    (crop-type (string-utf8 50))
    (farm-size uint))
  (let ((farmer-id (+ (var-get last-farmer-id) u1)))
    (var-set last-farmer-id farmer-id)
    (map-set farmers
      { farmer-id: farmer-id }
      {
        name: name,
        location: location,
        crop-type: crop-type,
        farm-size: farm-size,
        registered-at: block-height
      }
    )
    (ok farmer-id)
  )
)

(define-read-only (get-farmer (farmer-id uint))
  (map-get? farmers { farmer-id: farmer-id })
)

(define-read-only (get-farmer-count)
  (var-get last-farmer-id)
)
