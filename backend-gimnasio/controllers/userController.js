const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const roleNames = {
  admin: 'Admin',
  coach: 'Coach',
  member: 'Member'
};

const roleIds = {
  admin: 3,
  coach: 2,
  member: 1
};

exports.getUsersByRole = asyncHandler(async (req, res) => {
  const roleParam = req.params.roleName?.toLowerCase();
  const roleName = roleNames[roleParam];
  const roleId = roleIds[roleParam];

  if (!roleName || !roleId) {
    throw new AppError('Rol no válido. Usa admin, coach o member.', 400);
  }

  const users = await userService.getUsersByRole(roleId, roleName);
  res.json({ success: true, users });
});

exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await userService.getDashboardSummary();
  res.json({ success: true, summary });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const { firstName, lastName, email, phone } = req.body;

  if (!userId || !firstName || !lastName || !email) {
    throw new AppError('Faltan campos obligatorios para actualizar el usuario.', 400);
  }

  await userService.updateUser(userId, { firstName, lastName, email, phone });
  res.json({ success: true, message: 'Usuario actualizado correctamente.' });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) throw new AppError('ID de usuario inválido.', 400);

  await userService.setStatus(userId, 'I');
  res.json({ success: true, message: 'Usuario inhabilitado correctamente.' });
});

exports.activateUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) throw new AppError('ID de usuario inválido.', 400);

  await userService.setStatus(userId, 'A');
  res.json({ success: true, message: 'Usuario activado correctamente.' });
});

exports.hardDeleteUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) throw new AppError('ID de usuario inválido.', 400);

  try {
    await userService.hardDeleteUser(userId);
    res.json({ success: true, message: 'Usuario eliminado de forma permanente.' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('No se pudo eliminar de forma permanente. Puede que tenga otros registros dependientes.', 500);
  }
});

exports.getUserSubscription = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) throw new AppError('ID de usuario no válido.', 400);

  const subscription = await userService.getUserSubscription(userId);
  res.json({ success: true, subscription });
});

exports.getUserNotifications = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) throw new AppError('ID de usuario no válido.', 400);

  const notifications = await userService.getUserNotifications(userId);
  res.json({ success: true, notifications });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const notifId = Number(req.params.notifId);
  if (!userId || !notifId) throw new AppError('Parámetros no válidos.', 400);

  await userService.markNotificationRead(userId, notifId);
  res.json({ success: true, message: 'Notificación marcada como leída.' });
});

exports.getUserPayments = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) throw new AppError('ID de usuario no válido.', 400);

  const payments = await userService.getUserPayments(userId);
  res.json({ success: true, payments });
});

exports.changePasswordByAdmin = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const { newPassword } = req.body;

  if (!userId || !newPassword) throw new AppError('ID de usuario o nueva contraseña no válidos.', 400);

  await userService.changePasswordByAdmin(userId, newPassword);
  res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
});

exports.changeUserPassword = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const { currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) throw new AppError('Faltan datos.', 400);

  await userService.changeUserPassword(userId, currentPassword, newPassword);
  res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
});
