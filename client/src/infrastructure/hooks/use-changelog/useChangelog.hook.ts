import type { ChangeLogEntry } from "../../domain";
import { type ChangelogState, addChangeLog, clearChangeLog } from "../../redux";
import { useDispatch, useSelector } from "react-redux";

export const useChangelog = () => {
    const dispatch = useDispatch();

    const changelogs = useSelector((state: ChangelogState) => state.changelogs);
    return {
        changelogs,

        addChangeLog: (
			changeLog: ChangeLogEntry
		) => dispatch(
			addChangeLog(changeLog)
		),

		clearChangeLog: () => dispatch(clearChangeLog()),

    }
}