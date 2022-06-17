import {INestApplication} from "@nestjs/common";
import setup from "./utils/setup";
import prepareAndTestStatusOperations from "./utils/prepare";
import getAllStatuses from "./utils/get-all-statuses";
import before from "./utils/before";

import {
  allMightToken,
  authType,
} from "./utils/mocks";
import {UpdateMarker} from "../../../src/products/dto/status.model";


jest.setTimeout(3 * 60 * 1000);

describe('StatusModule (e2e)', () => {
  let app: INestApplication;
  let agent = null;

  beforeAll(async () => {
    const setting = await setup()

    app = setting.app;
    agent = setting.agent;
  });

  beforeEach(before);

  describe('DELETE /api/v1/status', () => {
    it('single deleted', async () => {
      // Prepare
      const {randomUUID, streamId} =
        await prepareAndTestStatusOperations(agent);

      const getAllResponseLoaded = await getAllStatuses(agent);
      const matched = getAllResponseLoaded.body?.data;
      const reallyToBeDeleted = matched[0];
      const reallyToBeDeletedId = reallyToBeDeleted.id;

      // make like 'deleted'
      reallyToBeDeleted.marker.deleted = true;
      reallyToBeDeleted.marker = expect.objectContaining({
        ...reallyToBeDeleted.marker
      });
      reallyToBeDeleted.payload = null;
      delete reallyToBeDeleted['stream'];

      // Act
      const deleteFailedResponse = await agent
        .delete(`/api/v1/status/${randomUUID}`)
        .auth(allMightToken, authType)
        .send({ stream_id: streamId })
        .expect(200);

      const deleteResponse = await agent
        .delete(`/api/v1/status/${reallyToBeDeletedId}`)
        .auth(allMightToken, authType)
        .send({ stream_id: streamId }).expect(200);

      const getStatusesResponseAfterCleaned = await getAllStatuses(agent);
      const matchedAfterDeleted = getStatusesResponseAfterCleaned.body?.data;

      // Check
      expect(deleteFailedResponse?.body?.data?.id).toEqual(randomUUID);
      expect(deleteFailedResponse?.body?.data?.comment).toEqual('update not found');
      expect(deleteResponse?.body?.data?.id).toEqual(reallyToBeDeletedId);
      expect(deleteResponse?.body?.data?.comment).toEqual('deleted');


      expect(matchedAfterDeleted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...reallyToBeDeleted
          }),
          expect.objectContaining({
            ...(matched[1])
          }),
          expect.objectContaining({
            ...(matched[2])
          })
        ])
      );
    });

    it('mutliple deleted non-existing skipped', async () => {
      // Prepare
      const {randomUUID, validStatusUpdates, streamId: stream_id} =
        await prepareAndTestStatusOperations(agent);
      const ids = validStatusUpdates.status_updates.map(el => el.id);
      ids.push(randomUUID);

      const getAllResponseLoaded = await getAllStatuses(agent);
      const matched = getAllResponseLoaded.body?.data;

      // Act
      const deletedManyResponse = await agent
        .delete(`/api/v1/status`)
        .auth(allMightToken, authType)
        .send({ ids, stream_id }).expect(200);

      // Check
      const expectedResults = [
        {
          comment: "deleted",
          id: expect.any(String)
        },
        {
          comment: "deleted",
          id: expect.any(String)
        },
        {
          comment: "deleted",
          id: expect.any(String)
        },
        {
          comment: "update not found",
          id: expect.any(String)
        }
      ];
      const actualResults = deletedManyResponse.body.data;

      const getStatusesResponseAfterCleaned = await getAllStatuses(agent);
      const matchedAfterDeleted = getStatusesResponseAfterCleaned.body?.data;

      const matchedDeleted = matched.map(el => {
        const result = {...el};
        result.marker.deleted = true;
        result.marker = expect.objectContaining({
          ...result.marker
        });
        result.payload = null;
        delete el['stream'];
        return result;
      });

      // Check
      expect(expectedResults).toEqual(actualResults);

      expect(matchedAfterDeleted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...(matchedDeleted[0])
          }),
          expect.objectContaining({
            ...(matchedDeleted[1])
          }),
          expect.objectContaining({
            ...(matchedDeleted[2])
          })
        ])
      );
    });

    it('multiple deleted by range', async () => {
      // Prepare
      const {validStatusUpdates, streamId: stream_id} =
        await prepareAndTestStatusOperations(agent);

      const [first, second] = validStatusUpdates.status_updates;
      const from = new Date(first.recorded_at).toISOString();
      const to = new Date(second.recorded_at).toISOString();
      const fromTs = new Date(from).valueOf();
      const toTs = new Date(to).valueOf();

      // Act
      const getByRange = async () => agent
        .get(`/api/v1/status`)
        .query({from: fromTs, to: toTs})
        .auth(allMightToken, authType)
        .expect(200);

      const getByRangeResponseLoaded = await getByRange();

      const matched = getByRangeResponseLoaded.body?.data;

      const matchMarker = new UpdateMarker();
      expect(matched.length).toEqual(2);
      expect(matched[0].id).toEqual(validStatusUpdates.status_updates[0].id);
      expect(matched[1].id).toEqual(validStatusUpdates.status_updates[1].id);
      expect(matched[0].marker).toMatchObject(matchMarker);
      expect(matched[1].marker).toMatchObject(matchMarker);

      await agent.delete(`/api/v1/status/update/range`)
        .auth(allMightToken, authType)
        .send({from, to, stream_id})
        .expect(200);

      const getByRangeResponseAfterCleaned = await getByRange();
      const matchedAfterDeleted = getByRangeResponseAfterCleaned.body?.data;

      const matchedDeleted = matched.map(el => {
        const result = {...el};
        result.marker.deleted = true;
        result.marker = expect.objectContaining({
          ...result.marker
        });
        result.payload = null;
        delete el['stream'];
        return result;
      });

      expect(matchedAfterDeleted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...(matchedDeleted[0])
          }),
          expect.objectContaining({
            ...(matchedDeleted[1])
          })
        ])
      );

    })
  });

  afterAll(async () => {
    await app.close();
  });
})
