export enum Status {
    'pending' = 'pending',
    'confirmed' = 'confirmed',
    'declined' = 'declined',
    'expired' = 'expired',
}

export class IssueNewKeyPairResponse {
    uuid!: string;
    consent_id!: string;
    status!: Status;
    tag!: string;
}
