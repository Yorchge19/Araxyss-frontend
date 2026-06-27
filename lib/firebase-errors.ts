/**
 * Centralized Firebase error handling utility.
 * Parses Firebase errors and returns user-friendly + developer-friendly messages.
 */

export interface ParsedFirebaseError {
  /** User-friendly message (safe to display in the UI) */
  userMessage: string;
  /** Developer-friendly message with full details (for console logging) */
  devMessage: string;
  /** The Firebase error code (e.g., 'permission-denied', 'not-found') */
  code: string;
  /** The Firestore collection or operation that failed */
  context: string;
}

/**
 * Maps Firebase error codes to user-friendly messages in Spanish.
 */
const FIREBASE_ERROR_MAP: Record<string, string> = {
  'permission-denied': 'No tienes permisos para realizar esta acción. Verifica que seas miembro del workspace.',
  'not-found': 'El recurso solicitado no existe o fue eliminado.',
  'already-exists': 'Este recurso ya existe.',
  'resource-exhausted': 'Se ha excedido el límite de solicitudes. Intenta de nuevo en unos minutos.',
  'failed-precondition': 'La operación no se puede realizar en el estado actual. Recarga la página.',
  'aborted': 'La operación fue cancelada. Intenta de nuevo.',
  'out-of-range': 'Valor fuera de rango.',
  'unimplemented': 'Esta funcionalidad no está disponible.',
  'internal': 'Error interno del servidor. Intenta de nuevo más tarde.',
  'unavailable': 'El servicio no está disponible. Verifica tu conexión a internet.',
  'data-loss': 'Pérdida de datos irrecuperable.',
  'unauthenticated': 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
};

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
const AUTH_ERROR_MAP: Record<string, string> = {
  'auth/email-already-in-use': 'Este correo electrónico ya está registrado.',
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/operation-not-allowed': 'Este método de autenticación no está habilitado.',
  'auth/weak-password': 'La contraseña es muy débil. Usa al menos 6 caracteres.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo más tarde.',
  'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet.',
  'auth/popup-closed-by-user': 'La ventana de inicio de sesión fue cerrada.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado para iniciar sesión.',
  'auth/invalid-credential': 'Las credenciales son inválidas o han expirado.',
};

/**
 * Parse a Firebase error into a structured, user-friendly format.
 * 
 * @param error - The caught error object
 * @param context - Description of what operation was attempted (e.g., "cargar workspaces", "crear tarea")
 * @returns ParsedFirebaseError with user-friendly and developer-friendly messages
 */
export function parseFirebaseError(error: unknown, context: string): ParsedFirebaseError {
  // Default values
  let code = 'unknown';
  let userMessage = `Error al ${context}. Intenta de nuevo.`;
  let devMessage = `[Firebase Error] Context: ${context}`;

  if (error && typeof error === 'object') {
    const err = error as any;
    
    // Extract error code
    if (err.code) {
      code = err.code;
    }
    
    // Check if it's a Firestore permission error
    if (
      code === 'permission-denied' || 
      err.message?.includes('Missing or insufficient permissions') ||
      err.message?.includes('PERMISSION_DENIED')
    ) {
      code = 'permission-denied';
      userMessage = getPermissionErrorMessage(context);
      devMessage = `[Firebase PERMISSION_DENIED] Context: ${context} | ` +
        `Este error generalmente indica que las reglas de seguridad de Firestore ` +
        `están rechazando la operación. Verifica: ` +
        `1) Que el usuario esté autenticado, ` +
        `2) Que el usuario sea miembro del workspace, ` +
        `3) Que las reglas de Firestore permitan esta operación. ` +
        `| Original: ${err.message || 'N/A'} | Code: ${err.code || 'N/A'}`;
    }
    // Check Auth errors
    else if (code.startsWith('auth/')) {
      userMessage = AUTH_ERROR_MAP[code] || `Error de autenticación: ${err.message || code}`;
      devMessage = `[Firebase Auth Error] Code: ${code} | Context: ${context} | Message: ${err.message || 'N/A'}`;
    }
    // Check Firestore errors
    else if (FIREBASE_ERROR_MAP[code]) {
      userMessage = FIREBASE_ERROR_MAP[code];
      devMessage = `[Firebase Error] Code: ${code} | Context: ${context} | Message: ${err.message || 'N/A'}`;
    }
    // Generic Firebase error with message
    else if (err.message) {
      userMessage = `Error al ${context}: ${err.message}`;
      devMessage = `[Error] Context: ${context} | Code: ${code} | Message: ${err.message} | Stack: ${err.stack || 'N/A'}`;
    }
  } else if (typeof error === 'string') {
    userMessage = error;
    devMessage = `[Error String] Context: ${context} | ${error}`;
  }

  return { userMessage, devMessage, code, context };
}

/**
 * Generate a specific permission error message based on the context of the operation.
 */
function getPermissionErrorMessage(context: string): string {
  const contextLower = context.toLowerCase();
  
  if (contextLower.includes('workspace') || contextLower.includes('espacio')) {
    return '⚠️ No tienes permisos para acceder a este workspace. ' +
      'Puede que no seas miembro o que tu acceso haya sido revocado. ' +
      'Contacta al administrador del workspace.';
  }
  if (contextLower.includes('tarea') || contextLower.includes('task')) {
    return '⚠️ No tienes permisos para gestionar tareas en este workspace. ' +
      'Solo los miembros con rol de Owner, Admin o User pueden hacerlo.';
  }
  if (contextLower.includes('canal') || contextLower.includes('channel') || contextLower.includes('mensaje') || contextLower.includes('message')) {
    return '⚠️ No tienes permisos para acceder a los canales de chat. ' +
      'Verifica que seas miembro del workspace.';
  }
  if (contextLower.includes('ticket')) {
    return '⚠️ No tienes permisos para gestionar tickets en este workspace. ' +
      'Verifica tu membresía en el workspace.';
  }
  if (contextLower.includes('usuario') || contextLower.includes('user') || contextLower.includes('perfil')) {
    return '⚠️ No tienes permisos para acceder a la información de usuario. ' +
      'Verifica que hayas iniciado sesión correctamente.';
  }
  if (contextLower.includes('invit')) {
    return '⚠️ No tienes permisos para gestionar invitaciones. ' +
      'Solo el Owner o Admin del workspace puede hacerlo.';
  }
  
  return '⚠️ No tienes permisos suficientes para esta acción. ' +
    'Verifica que seas miembro del workspace y tengas el rol adecuado.';
}

/**
 * Log a Firebase error to the console with full details.
 * Always call this alongside showing the user message.
 */
export function logFirebaseError(parsed: ParsedFirebaseError, originalError?: unknown): void {
  console.group(`🔥 Firebase Error — ${parsed.context}`);
  console.error(parsed.devMessage);
  console.log('Código:', parsed.code);
  console.log('Mensaje al usuario:', parsed.userMessage);
  if (originalError) {
    console.log('Error original:', originalError);
  }
  console.groupEnd();
}
