// Permanently purges the signed-in person's account: their events, their
// invitations and the app user record itself.
export async function purgeAccount(base44, user) {
  const service = base44.asServiceRole;
  await service.entities.Event.deleteMany({ created_by_id: user.id });
  await service.entities.Invitation.deleteMany({ created_by_id: user.id });
  await service.entities.User.delete(user.id);
  return { deleted: true };
}