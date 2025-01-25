import { UserRole, UserStatus, ServiceStatus, IncidentStatus, Impact } from "@prisma/client";

export {
    UserRole,
    UserStatus,
    ServiceStatus,
    IncidentStatus,
    Impact,
}

export const NEGATED_USER_STATUS: UserStatus[] = [
    UserStatus.INVITATION_REJECTED,
    UserStatus.INVITATION_REVOKED,
    UserStatus.REMOVED_BY_SELF,
    UserStatus.REMOVED_BY_ADMIN,
]