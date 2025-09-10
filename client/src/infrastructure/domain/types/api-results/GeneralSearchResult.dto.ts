import { CrossRefResultDto } from './CrossRefRresult.dto';
import { LensResultDto } from './LensResult.dto';
import { OpenAlexResultDto } from './OpenAlexResult.dto';
import { UnpaywallResultDto } from './UnpaywallResult.dto';

export type GeneralSearchResultDto = {
	crossRefResults: CrossRefResultDto;
	openAlexResults: OpenAlexResultDto;
	unpaywallResults: UnpaywallResultDto;
	lensResults: LensResultDto;
}