import {Readable, ReadableOptions} from "stream";
import {S3} from "aws-sdk";

export class InteractiveS3Stream extends Readable {
    _currPos = 0;
    _s3: S3;
    _s3Spec: S3.GetObjectRequest;
    _chunkSize = 1024;
    _maxLen: number;

    constructor(
        spec: S3.GetObjectRequest,
        s3: S3,
        maxLen: number,
        chunkSize: number,

        parentOptions?: ReadableOptions
    ) {
        super(parentOptions);
        this._s3 = s3;
        this._s3Spec = spec;
        this._chunkSize = chunkSize;
        this._maxLen = maxLen;
    }


    _read() {
        if (this._currPos > this._maxLen) {
            this.push(null);
        } else {
            const maybeRange = this._currPos + this._chunkSize;
            const rangeToApply = maybeRange < this._maxLen ? maybeRange : this._maxLen;
            this._s3Spec.Range = `bytes=${this._currPos}-${rangeToApply}`;

            this._currPos = rangeToApply + 1;
            this._s3.getObject(this._s3Spec, (error, data) => {
                if (error) {
                    this.destroy(error);
                } else {
                    this.push(data.Body);
                }
            });
        }
    }
}