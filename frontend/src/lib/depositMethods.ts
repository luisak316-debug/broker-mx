export type DepositMethod = 'TRANSFERENCIA' | 'TARJETA' | 'VENTANILLA' | 'OXXO';

export type PaymentTab = 'transferencia' | 'tarjeta' | 'ventanilla' | 'oxxo';

export const DEPOSIT_METHOD_LABEL: Record<DepositMethod, string> = {
  TRANSFERENCIA: 'Transferencia bancaria / SPEI',
  TARJETA: 'Tarjeta débito / crédito',
  VENTANILLA: 'Depósito en ventanilla bancaria',
  OXXO: 'Depósito en tiendas OXXO',
};

export const DEPOSIT_METHOD_TAB_LABEL: Record<PaymentTab, string> = {
  transferencia: 'Transferencia SPEI',
  tarjeta: 'Tarjeta',
  ventanilla: 'Ventanilla',
  oxxo: 'OXXO',
};

export const DEPOSIT_METHOD_ICON: Record<DepositMethod, string> = {
  TRANSFERENCIA: '🏦',
  TARJETA: '💳',
  VENTANILLA: '🏛️',
  OXXO: '🏪',
};

export const DEPOSIT_METHOD_TAB_ICON: Record<PaymentTab, string> = {
  transferencia: '🏦',
  tarjeta: '💳',
  ventanilla: '🏛️',
  oxxo: '🏪',
};

export const ALL_PAYMENT_TABS: PaymentTab[] = ['transferencia', 'tarjeta', 'ventanilla', 'oxxo'];

export function methodToTab(method: DepositMethod): PaymentTab {
  const map: Record<DepositMethod, PaymentTab> = {
    TRANSFERENCIA: 'transferencia',
    TARJETA: 'tarjeta',
    VENTANILLA: 'ventanilla',
    OXXO: 'oxxo',
  };
  return map[method];
}

export function tabToMethod(tab: PaymentTab): DepositMethod {
  const map: Record<PaymentTab, DepositMethod> = {
    transferencia: 'TRANSFERENCIA',
    tarjeta: 'TARJETA',
    ventanilla: 'VENTANILLA',
    oxxo: 'OXXO',
  };
  return map[tab];
}

export function depositInstructions(method: DepositMethod): string {
  switch (method) {
    case 'VENTANILLA':
      return 'Acude a cualquier sucursal del banco indicado en México y realiza tu depósito en ventanilla con el número de cuenta asignado.';
    case 'TARJETA':
      return 'Paga con tarjeta mediante el enlace seguro que tu asesor te enviará, o solicítalo desde aquí con el monto a invertir.';
    case 'OXXO':
      return 'Acude a cualquier tienda OXXO en México, indica que harás un pago de servicio y proporciona tu número de referencia asignado.';
    default:
      return 'Desde tu app bancaria o banca en línea, envía una transferencia SPEI a la cuenta institucional de Broker.mx.';
  }
}

export function confirmDepositLabel(method: DepositMethod): string {
  switch (method) {
    case 'VENTANILLA':
      return 'Ya realicé mi depósito en ventanilla';
    case 'TARJETA':
      return 'Solicitar enlace de pago con tarjeta';
    case 'OXXO':
      return 'Ya realicé mi pago en OXXO';
    default:
      return 'Ya realicé mi transferencia';
  }
}

export function cashRequestMethod(method: DepositMethod): 'SPEI' | 'VENTANILLA' | 'TARJETA' | 'OXXO' {
  if (method === 'TRANSFERENCIA') return 'SPEI';
  return method;
}
