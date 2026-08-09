-- Idempotencia del cobro: impide que un mismo pago de PayPal genere dos
-- suscripciones si el navegador reintenta o si el webhook llega duplicado.
CREATE UNIQUE INDEX UX_Payments_ReferenceNumber
    ON Payments(ReferenceNumber)
    WHERE ReferenceNumber IS NOT NULL;
