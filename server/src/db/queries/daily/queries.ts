import { Pool } from "pg";
import { DailyPlayerStatQueries } from "./player/stats";
import { DailyPlayerPlaytimeQueries } from "./player/playtime";
import { DailyRewardQueries } from "./reward";
import { DailyQuestQueries } from "./quest";
import { DailyMobLimitQueries } from "./mob/limit";

export class Daily {
  private _playerStats?: DailyPlayerStatQueries;

  private _playerPlaytime?: DailyPlayerPlaytimeQueries;

  private _reward?: DailyRewardQueries;

  private _quest?: DailyQuestQueries;

  private _mobLimit?: DailyMobLimitQueries;

  constructor(protected db: Pool) {}

  get playerStats(): DailyPlayerStatQueries {
    if (!this._playerStats) {
      this._playerStats = new DailyPlayerStatQueries(this.db);
    }
    return this._playerStats;
  }

  get playerPlaytime(): DailyPlayerPlaytimeQueries {
    if (!this._playerPlaytime) {
      this._playerPlaytime = new DailyPlayerPlaytimeQueries(this.db);
    }
    return this._playerPlaytime;
  }

  get reward(): DailyRewardQueries {
    if (!this._reward) {
      this._reward = new DailyRewardQueries(this.db);
    }
    return this._reward;
  }

  get quest(): DailyQuestQueries {
    if (!this._quest) {
      this._quest = new DailyQuestQueries(this.db);
    }
    return this._quest;
  }

  get mobLimit(): DailyMobLimitQueries {
    if (!this._mobLimit) {
      this._mobLimit = new DailyMobLimitQueries(this.db);
    }
    return this._mobLimit;
  }
}
